/**
 * Frontend file storage utility
 * Handles saving and retrieving files from localStorage and IndexedDB
 */

const DB_NAME = 'CMHWReportDB';
const STORE_NAME = 'files';
const METADATA_KEY = 'cmhw_files_metadata';

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

// Save file to IndexedDB
export const saveFileToIndexedDB = async (fileName, content, type = 'text/html') => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    
    const file = {
      fileName,
      content,
      type,
      createdAt: new Date().toISOString(),
      timestamp: Date.now()
    };
    
    const request = store.add(file);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        // Also save metadata to localStorage for quick access
        saveMetadata(fileName);
        resolve({ success: true, id: request.result });
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('IndexedDB save error:', error);
    // Fallback to localStorage
    return saveFileToLocalStorage(fileName, content);
  }
};

// Retrieve file from IndexedDB
export const getFileFromIndexedDB = async (fileName) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const files = request.result;
        const file = files.find(f => f.fileName === fileName);
        resolve(file || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('IndexedDB retrieve error:', error);
    return getFileFromLocalStorage(fileName);
  }
};

// Get all files for today from IndexedDB
export const getAllFilesFromIndexedDB = async () => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const files = request.result;
        const today = new Date().toISOString().split('T')[0];
        
        const todaysFiles = files
          .filter(file => file.createdAt.startsWith(today))
          .map(file => ({
            fileName: file.fileName,
            title: extractTitle(file.fileName),
            cmh: extractCMH(file.fileName),
            cmhName: getCMHName(extractCMH(file.fileName)),
            createdAt: new Date(file.createdAt)
          }))
          .sort((a, b) => b.createdAt - a.createdAt);
        
        resolve(todaysFiles);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('IndexedDB getAll error:', error);
    return getAllFilesFromLocalStorage();
  }
};

// Delete file from IndexedDB
export const deleteFileFromIndexedDB = async (fileName) => {
  try {
    const db = await initDB();
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const files = request.result;
        const file = files.find(f => f.fileName === fileName);
        
        if (file) {
          const deleteRequest = store.delete(file.id);
          deleteRequest.onsuccess = () => {
            removeMetadata(fileName);
            resolve({ success: true });
          };
          deleteRequest.onerror = () => reject(deleteRequest.error);
        } else {
          resolve({ success: false, error: 'File not found' });
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('IndexedDB delete error:', error);
    return deleteFileFromLocalStorage(fileName);
  }
};

// LocalStorage fallback methods
const saveFileToLocalStorage = (fileName, content) => {
  try {
    const key = `cmhw_file_${fileName}`;
    localStorage.setItem(key, content);
    saveMetadata(fileName);
    return { success: true };
  } catch (error) {
    console.error('LocalStorage save error:', error);
    return { success: false, error: error.message };
  }
};

const getFileFromLocalStorage = (fileName) => {
  try {
    const key = `cmhw_file_${fileName}`;
    const content = localStorage.getItem(key);
    return content ? { fileName, content } : null;
  } catch (error) {
    console.error('LocalStorage retrieve error:', error);
    return null;
  }
};

const getAllFilesFromLocalStorage = () => {
  try {
    const metadata = JSON.parse(localStorage.getItem(METADATA_KEY) || '[]');
    const today = new Date().toISOString().split('T')[0];
    
    return metadata
      .filter(item => item.createdAt.startsWith(today))
      .map(item => ({
        fileName: item.fileName,
        title: item.title,
        cmh: item.cmh,
        cmhName: item.cmhName,
        createdAt: new Date(item.createdAt)
      }))
      .sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error('LocalStorage getAll error:', error);
    return [];
  }
};

const deleteFileFromLocalStorage = (fileName) => {
  try {
    const key = `cmhw_file_${fileName}`;
    localStorage.removeItem(key);
    removeMetadata(fileName);
    return { success: true };
  } catch (error) {
    console.error('LocalStorage delete error:', error);
    return { success: false, error: error.message };
  }
};

// Metadata management
const saveMetadata = (fileName) => {
  try {
    const metadata = JSON.parse(localStorage.getItem(METADATA_KEY) || '[]');
    
    // Check if already exists
    const existing = metadata.findIndex(m => m.fileName === fileName);
    const fileInfo = {
      fileName,
      title: extractTitle(fileName),
      cmh: extractCMH(fileName),
      cmhName: getCMHName(extractCMH(fileName)),
      createdAt: new Date().toISOString()
    };
    
    if (existing >= 0) {
      metadata[existing] = fileInfo;
    } else {
      metadata.push(fileInfo);
    }
    
    localStorage.setItem(METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Metadata save error:', error);
  }
};

const removeMetadata = (fileName) => {
  try {
    const metadata = JSON.parse(localStorage.getItem(METADATA_KEY) || '[]');
    const filtered = metadata.filter(m => m.fileName !== fileName);
    localStorage.setItem(METADATA_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Metadata remove error:', error);
  }
};

// Helper functions
const extractTitle = (fileName) => {
  const parts = fileName.replace('.html', '').split('_');
  return parts.length >= 3 ? parts.slice(2).join('_') : 'Unknown';
};

const extractCMH = (fileName) => {
  const parts = fileName.split('_');
  return parts.length >= 2 ? parts[1] : 'unknown';
};

const getCMHName = (cmh) => {
  const cmhConfigs = {
    cmh1: 'test',
    cmh2: 'CMH 2',
    cmh3: 'CMH 3'
  };
  return cmhConfigs[cmh] || cmh.toUpperCase();
};

// Download file to user's device
export const downloadFile = (fileName, content, mimeType = 'text/html') => {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download error:', error);
    throw error;
  }
};

// Export to file (for testing/backup)
export const exportMetadata = () => {
  try {
    const metadata = JSON.parse(localStorage.getItem(METADATA_KEY) || '[]');
    const blob = new Blob([JSON.stringify(metadata, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cmhw_files_metadata_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Export error:', error);
    throw error;
  }
};

const fileStorageModule = {
  initDB,
  saveFileToIndexedDB,
  getFileFromIndexedDB,
  getAllFilesFromIndexedDB,
  deleteFileFromIndexedDB,
  downloadFile,
  exportMetadata
};

export default fileStorageModule;
