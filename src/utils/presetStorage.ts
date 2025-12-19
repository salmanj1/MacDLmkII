type StoredEntry<T> = T[];

const DB_NAME = 'macdlmkii-presets';
const DB_VERSION = 1;
const STORE_NAME = 'library';

const openDb = () =>
  new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME);
      }
    };
  });

export async function loadPresetLibrary<T>(): Promise<StoredEntry<T> | null> {
  try {
    const db = await openDb();
    return await new Promise<StoredEntry<T> | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get('library');
      getReq.onerror = () => reject(getReq.error);
      getReq.onsuccess = () => resolve((getReq.result as StoredEntry<T>) ?? null);
    });
  } catch (error) {
    console.warn('IndexedDB load failed, falling back to localStorage', error);
    try {
      const raw = localStorage.getItem('macdlmkii-preset-library');
      return raw ? (JSON.parse(raw) as StoredEntry<T>) : null;
    } catch (err) {
      console.warn('LocalStorage fallback failed', err);
      return null;
    }
  }
}

export async function savePresetLibrary<T>(entries: StoredEntry<T>): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put(entries, 'library');
      putReq.onerror = () => reject(putReq.error);
      putReq.onsuccess = () => resolve();
    });
  } catch (error) {
    console.warn('IndexedDB save failed, falling back to localStorage', error);
    try {
      localStorage.setItem('macdlmkii-preset-library', JSON.stringify(entries));
    } catch (err) {
      console.warn('LocalStorage fallback save failed', err);
    }
  }
}
