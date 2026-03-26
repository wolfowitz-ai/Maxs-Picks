export interface IObjectStorageAdapter {
  getUploadUrlAndPath(): Promise<{ uploadURL: string; objectPath: string }>;
  deleteObjectEntity(objectPath: string): Promise<void>;
  normalizeObjectEntityPath(rawPath: string): string;
}

let _adapter: IObjectStorageAdapter | null = null;

export async function initObjectStorageAdapter(): Promise<IObjectStorageAdapter> {
  if (_adapter) return _adapter;

  if (process.env.LOCAL_STORAGE === "true") {
    const { LocalObjectStorageService } = await import("./local-storage-adapter");
    _adapter = new LocalObjectStorageService() as IObjectStorageAdapter;
  } else {
    const { ObjectStorageService } = await import("./replit_integrations/object_storage");
    _adapter = new ObjectStorageService() as IObjectStorageAdapter;
  }

  return _adapter;
}

export function getObjectStorageAdapter(): IObjectStorageAdapter {
  if (!_adapter) {
    throw new Error("Object storage adapter not initialized. Call initObjectStorageAdapter() first.");
  }
  return _adapter;
}
