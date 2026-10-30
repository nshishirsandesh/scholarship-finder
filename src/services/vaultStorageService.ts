import { VaultDocument, DocumentCategory, DocumentLifecycleStatus } from '../types/documentVault';

const DB_NAME = 'ScholarshipFinderVaultDB';
const DB_VERSION = 1;
const STORE_FILES = 'vault_files';
const STORE_METADATA = 'vault_metadata';

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/jpg',
];

// In-memory fallback for environments without IndexedDB (e.g., Node.js / unit tests)
const memoryBlobStore = new Map<string, Blob>();
const memoryMetadataStore = new Map<string, VaultDocument[]>();

function openVaultDatabase(): Promise<IDBDatabase | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }

    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_FILES)) {
          db.createObjectStore(STORE_FILES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_METADATA)) {
          const metaStore = db.createObjectStore(STORE_METADATA, { keyPath: 'id' });
          metaStore.createIndex('userId', 'userId', { unique: false });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('[VaultStorage] IndexedDB open error, falling back to in-memory store.');
        resolve(null);
      };
    } catch {
      resolve(null);
    }
  });
}

export function validateDocumentFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file selected for upload.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File is too large (${sizeInMb} MB). Maximum supported file size is 10 MB.`,
    };
  }

  // Check MIME type or file extension fallback
  const ext = file.name.split('.').pop()?.toLowerCase();
  const validExts = ['pdf', 'png', 'jpg', 'jpeg'];
  const isValidType = ALLOWED_MIME_TYPES.includes(file.type) || (ext && validExts.includes(ext));

  if (!isValidType) {
    return {
      valid: false,
      error: `Unsupported file format (${file.type || ext}). Please upload PDF, PNG, or JPG/JPEG documents.`,
    };
  }

  return { valid: true };
}

export async function saveVaultDocumentFile(
  userId: string,
  file: File,
  documentType: string,
  category: DocumentCategory,
  name: string,
  extra?: { academicYear?: string; expiryDate?: string; notes?: string }
): Promise<VaultDocument> {
  const validation = validateDocumentFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const docId = `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date();

  // Determine status (check expiry if provided)
  let status: DocumentLifecycleStatus = 'Uploaded';
  if (extra?.expiryDate) {
    const expiry = new Date(extra.expiryDate);
    if (expiry.getTime() < now.getTime()) {
      status = 'Expired';
    }
  }

  const docMeta: VaultDocument = {
    id: docId,
    userId,
    documentType,
    category,
    name,
    fileName: file.name,
    fileSize: file.size,
    mimeType: file.type || 'application/octet-stream',
    uploadedAt: now.toISOString(),
    academicYear: extra?.academicYear || '2026-27',
    expiryDate: extra?.expiryDate,
    status,
    storageMode: 'local_prototype',
    notes: extra?.notes,
  };

  const db = await openVaultDatabase();

  if (!db) {
    // Memory store fallback
    memoryBlobStore.set(docId, file);
    const existing = memoryMetadataStore.get(userId) || [];
    // If replacing an existing document of the same type, keep both or mark
    memoryMetadataStore.set(userId, [docMeta, ...existing]);
    return docMeta;
  }

  return new Promise((resolve, reject) => {
    try {
      const tx = db.transaction([STORE_FILES, STORE_METADATA], 'readwrite');
      const fileStore = tx.objectStore(STORE_FILES);
      const metaStore = tx.objectStore(STORE_METADATA);

      fileStore.put({ id: docId, blob: file });
      metaStore.put(docMeta);

      tx.oncomplete = () => {
        // Also persist lightweight metadata in localStorage for instant sync
        try {
          const key = `scholarship_finder_vault_meta_${userId}`;
          const currentJson = localStorage.getItem(key);
          const currentList: VaultDocument[] = currentJson ? JSON.parse(currentJson) : [];
          localStorage.setItem(key, JSON.stringify([docMeta, ...currentList.filter(d => d.id !== docId)]));
        } catch {}
        resolve(docMeta);
      };

      tx.onerror = () => reject(new Error('Failed to save file in local IndexedDB vault.'));
    } catch (err) {
      reject(err);
    }
  });
}

export function getStoredVaultDocumentMetas(userId: string): VaultDocument[] {
  try {
    const key = `scholarship_finder_vault_meta_${userId}`;
    const local = localStorage.getItem(key);
    if (local) {
      const parsed: VaultDocument[] = JSON.parse(local);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return memoryMetadataStore.get(userId) || [];
}

export async function loadUserVaultDocuments(userId: string): Promise<VaultDocument[]> {
  // First check localStorage for synchronous fast restore
  try {
    const key = `scholarship_finder_vault_meta_${userId}`;
    const local = localStorage.getItem(key);
    if (local) {
      const parsed: VaultDocument[] = JSON.parse(local);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {}

  const db = await openVaultDatabase();
  if (!db) {
    return memoryMetadataStore.get(userId) || [];
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_METADATA, 'readonly');
      const store = tx.objectStore(STORE_METADATA);
      const index = store.index('userId');
      const request = index.getAll(userId);

      request.onsuccess = () => {
        const results: VaultDocument[] = request.result || [];
        // Sync to localStorage
        try {
          localStorage.setItem(`scholarship_finder_vault_meta_${userId}`, JSON.stringify(results));
        } catch {}
        resolve(results);
      };

      request.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

export async function getVaultDocumentBlob(docId: string): Promise<Blob | null> {
  if (memoryBlobStore.has(docId)) {
    return memoryBlobStore.get(docId) || null;
  }

  const db = await openVaultDatabase();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_FILES, 'readonly');
      const store = tx.objectStore(STORE_FILES);
      const request = store.get(docId);

      request.onsuccess = () => {
        if (request.result && request.result.blob) {
          resolve(request.result.blob);
        } else {
          resolve(null);
        }
      };

      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function deleteVaultDocument(userId: string, docId: string): Promise<void> {
  memoryBlobStore.delete(docId);
  const memList = memoryMetadataStore.get(userId);
  if (memList) {
    memoryMetadataStore.set(userId, memList.filter(d => d.id !== docId));
  }

  // Update localStorage
  try {
    const key = `scholarship_finder_vault_meta_${userId}`;
    const local = localStorage.getItem(key);
    if (local) {
      const currentList: VaultDocument[] = JSON.parse(local);
      localStorage.setItem(key, JSON.stringify(currentList.filter(d => d.id !== docId)));
    }
  } catch {}

  const db = await openVaultDatabase();
  if (!db) return;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction([STORE_FILES, STORE_METADATA], 'readwrite');
      tx.objectStore(STORE_FILES).delete(docId);
      tx.objectStore(STORE_METADATA).delete(docId);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function downloadVaultDocument(doc: VaultDocument): Promise<void> {
  const blob = await getVaultDocumentBlob(doc.id);
  if (!blob) {
    throw new Error('Document file binary could not be retrieved from local storage.');
  }

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = doc.fileName || `${doc.documentType}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}
