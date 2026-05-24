const DB_NAME = "slavecode-db";
const STORE_NAME = "diagram-snapshots";
const DB_VERSION = 1;

/**
 * IndexedDBHelper
 * Standard lightweight, promise-based client storage layer for slavecode.
 * Stores local snapshots of active whiteboards asynchronously without blocking the UI thread.
 */
export class IndexedDBHelper {
  private static openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      if (typeof window === "undefined" || !window.indexedDB) {
        reject(new Error("IndexedDB is not supported on this environment"));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: any) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = (event: any) => {
        resolve(event.target.result);
      };

      request.onerror = (event: any) => {
        reject(event.target.error || new Error("Failed to open IndexedDB"));
      };
    });
  }

  /**
   * Fetch saved local whiteboard data
   */
  static async get(key: string): Promise<any> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("IndexedDB get error:", err);
      return null;
    }
  }

  /**
   * Save canvas snapshot locally
   */
  static async set(key: string, value: any): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(value, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("IndexedDB set error:", err);
    }
  }

  /**
   * Evict single storage key
   */
  static async delete(key: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.error("IndexedDB delete error:", err);
    }
  }
}
