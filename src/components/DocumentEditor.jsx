import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pb } from '../utils/pocketbaseClient';

function DocumentEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [document, setDocument] = useState(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    if (id) {
      fetchDocument();
      subscribeToDocument();
    }
  }, [id, user]);

  const fetchDocument = async () => {
    try {
      const record = await pb.collection('documents').getOne(id);
      setDocument(record);
      setContent(record.content || '');
      setTitle(record.title || '');
    } catch (error) {
      console.error('Error fetching document:', error);
    }
  };

  const subscribeToDocument = () => {
    pb.collection('documents').subscribe(id, function (e) {
      if (e.action === 'update') {
        const updatedDoc = e.record;
        if (updatedDoc.content !== content) {
          setContent(updatedDoc.content);
        }
        if (updatedDoc.title !== title) {
          setTitle(updatedDoc.title);
        }
        setDocument(updatedDoc);
      }
    });

    return () => {
      pb.collection('documents').unsubscribe(id);
    };
  };

  const updateDocument = async (newContent) => {
    if (!user || !document) return;

    try {
      await pb.collection('documents').update(id, {
        content: newContent,
        updated: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating document:', error);
    }
  };

  const updateTitle = async () => {
    if (!title.trim()) return;

    try {
      await pb.collection('documents').update(id, {
        title: title,
        updated: new Date().toISOString()
      });
      setIsEditingTitle(false);
    } catch (error) {
      console.error('Error updating title:', error);
    }
  };

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    updateDocument(newContent);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadedFile = await pb.collection('files').create(formData);
      const fileUrl = pb.files.getUrl(uploadedFile, uploadedFile.file);

      // Insert file reference at cursor position
      const fileReference = `[FILE: ${file.name}](${fileUrl})\n`;
      insertTextAtCursor(fileReference);
      
    } catch (error) {
      console.error('Error uploading file:', error);
      // Fallback to object URL
      const fileUrl = URL.createObjectURL(file);
      const fileReference = `[FILE: ${file.name}](${fileUrl})\n`;
      insertTextAtCursor(fileReference);
    }

    setShowUploadModal(false);
  };

  const insertTextAtCursor = (text) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.substring(0, start) + text + content.substring(end);
    
    setContent(newContent);
    updateDocument(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + text.length, start + text.length);
    }, 0);
  };

  const formatText = (format) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);

    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText}\``;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        break;
      case 'h1':
        formattedText = `# ${selectedText}`;
        break;
      case 'h2':
        formattedText = `## ${selectedText}`;
        break;
      case 'bullet':
        formattedText = `- ${selectedText}`;
        break;
      default:
        formattedText = selectedText;
    }

    const newContent = content.substring(0, start) + formattedText + content.substring(end);
    setContent(newContent);
    updateDocument(newContent);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      if (format === 'link') {
        textarea.setSelectionRange(start + formattedText.length - 5, start + formattedText.length - 2);
      } else {
        textarea.setSelectionRange(start + formattedText.length, start + formattedText.length);
      }
    }, 0);
  };

  const downloadDocument = () => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${title || 'document'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (!document) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </button>
              
              {isEditingTitle ? (
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-xl font-bold border-b-2 border-blue-500 focus:outline-none px-2 py-1 bg-transparent"
                    onBlur={updateTitle}
                    onKeyPress={(e) => e.key === 'Enter' && updateTitle()}
                    autoFocus
                  />
                </div>
              ) : (
                <h1
                  className="text-xl font-bold text-gray-900 cursor-pointer hover:text-blue-600 px-2 py-1 rounded hover:bg-blue-50 transition"
                  onClick={() => setIsEditingTitle(true)}
                >
                  {title || 'Untitled Document'}
                </h1>
              )}
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={downloadDocument}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download
              </button>
              <button
                onClick={() => setShowUploadModal(true)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Upload File
              </button>
              <span className="text-sm text-gray-500">
                Last saved: {new Date(document.updated).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Formatting Toolbar */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 py-2 overflow-x-auto">
            <button
              onClick={() => formatText('h1')}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition"
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => formatText('h2')}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition"
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => formatText('bold')}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition font-bold"
              title="Bold"
            >
              B
            </button>
            <button
              onClick={() => formatText('italic')}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition italic"
              title="Italic"
            >
              I
            </button>
            <button
              onClick={() => formatText('code')}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition font-mono"
              title="Code"
            >
              &lt;/&gt;
            </button>
            <button
              onClick={() => formatText('link')}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition"
              title="Link"
            >
              🔗
            </button>
            <button
              onClick={() => formatText('bullet')}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 transition"
              title="Bullet List"
            >
              •
            </button>
          </div>
        </div>
      </div>

      {/* Editor */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleContentChange}
              className="w-full h-96 p-6 border-0 focus:ring-0 resize-none font-mono text-sm"
              placeholder={`# Welcome to Your Document!

Start typing your content here...

## Features:
- **Bold text** by selecting text and clicking "B"
- *Italic text* by selecting text and clicking "I"
- Code blocks with </>
- [Links](url) by selecting text and clicking 🔗
- Headers with H1/H2 buttons
- Bullet points with • button

You can also upload files using the Upload button above!`}
            />
          </div>

          {/* Editor Tips */}
          <div className="mt-4 bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
            <div className="flex items-center mb-2">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <strong>Quick Tips:</strong>
            </div>
            <ul className="list-disc list-inside space-y-1">
              <li>Select text and use the formatting buttons above</li>
              <li>Changes are saved automatically</li>
              <li>Upload files to add them as links</li>
              <li>Download your document anytime</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Upload File</h3>
            <p className="text-sm text-gray-600 mb-4">
              Uploaded files will be added as links in your document at the cursor position.
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="w-full mb-4"
              style={{ display: 'none' }}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowUploadModal(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                Select File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentEditor;