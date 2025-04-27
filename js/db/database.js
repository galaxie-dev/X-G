// Database configuration
const DB_CONFIG = {
    users: {
        name: 'XG_UsersDB',
        version: 1,
        stores: {
            profiles: { keyPath: 'id', autoIncrement: true },
            settings: { keyPath: 'userId' }
        }
    },
    content: {
        name: 'XG_ContentDB',
        version: 1,
        stores: {
            posts: { keyPath: 'id', autoIncrement: true },
            comments: { keyPath: 'id', autoIncrement: true },
            media: { keyPath: 'id', autoIncrement: true }
        }
    }
};

// Database Manager Class
class DatabaseManager {
    constructor(dbConfig) {
        this.dbConfig = dbConfig;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbConfig.name, this.dbConfig.version);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                for (const [storeName, storeConfig] of Object.entries(this.dbConfig.stores)) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        const store = db.createObjectStore(storeName, storeConfig);
                        
                        // Add indexes based on store type
                        switch (storeName) {
                            case 'profiles':
                                store.createIndex('email', 'email', { unique: true });
                                store.createIndex('username', 'username', { unique: true });
                                store.createIndex('handle', 'handle', { unique: true });
                                break;
                            case 'posts':
                                store.createIndex('userId', 'userId', { unique: false });
                                store.createIndex('timestamp', 'timestamp', { unique: false });
                                break;
                            case 'comments':
                                store.createIndex('postId', 'postId', { unique: false });
                                store.createIndex('userId', 'userId', { unique: false });
                                break;
                            case 'media':
                                store.createIndex('postId', 'postId', { unique: false });
                                break;
                        }
                    }
                }
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        return this.performTransaction(storeName, 'readwrite', store => {
            return store.add(data);
        });
    }

    async get(storeName, key) {
        return this.performTransaction(storeName, 'readonly', store => {
            return store.get(key);
        });
    }

    async getAll(storeName) {
        return this.performTransaction(storeName, 'readonly', store => {
            return store.getAll();
        });
    }

    async put(storeName, data) {
        return this.performTransaction(storeName, 'readwrite', store => {
            return store.put(data);
        });
    }

    async delete(storeName, key) {
        return this.performTransaction(storeName, 'readwrite', store => {
            return store.delete(key);
        });
    }

    // Helper method for transactions
    async performTransaction(storeName, mode, operation) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, mode);
            const store = transaction.objectStore(storeName);
            const request = operation(store);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Custom queries
    async queryByIndex(storeName, indexName, value) {
        return this.performTransaction(storeName, 'readonly', store => {
            const index = store.index(indexName);
            return index.getAll(value);
        });
    }
}

// Initialize database instances
const userDB = new DatabaseManager(DB_CONFIG.users);
const contentDB = new DatabaseManager(DB_CONFIG.content);

// Export database instances
export { userDB, contentDB };
