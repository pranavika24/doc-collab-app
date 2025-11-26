// Temporary mock for deployment - works with both import styles
const pb = {
  authStore: {
    model: null,
    isValid: false,
    token: null,
    clear: () => console.log('Auth cleared'),
    save: () => console.log('Auth saved')
  },
  collection: (name) => ({
    getList: () => Promise.resolve({ items: [], totalItems: 0 }),
    create: (data) => Promise.resolve({ id: 'mock', ...data }),
    update: (id, data) => Promise.resolve({ id, ...data }),
    delete: () => Promise.resolve(true)
  }),
  authWithPassword: () => Promise.resolve({ 
    token: 'mock', 
    record: { id: 'user-1', email: 'test@test.com' } 
  }),
  authRefresh: () => Promise.resolve({ 
    token: 'mock', 
    record: { id: 'user-1', email: 'test@test.com' } 
  })
};

// Export both as default and named for compatibility
export default pb;
export { pb }; // This allows import { pb } to work temporarilyfindstr /s "import { pb }" src\*
