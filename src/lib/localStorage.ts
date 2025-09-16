import { StorageProvider } from './storage';
import { promises as fs } from 'fs';
import path from 'path';

// Local Storage Provider Implementation (for development)
export class LocalStorageProvider implements StorageProvider {
  private uploadDir: string;

  constructor() {
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
  }

  isConfigured(): boolean {
    return true; // Local storage is always available
  }

  async upload(file: Buffer, key: string, contentType: string): Promise<string> {
    // Ensure upload directory exists
    await fs.mkdir(this.uploadDir, { recursive: true });
    
    // Extract filename from key (remove prefix)
    const filename = key.split('/').pop() || key;
    const filePath = path.join(this.uploadDir, filename);
    
    // Write file to local storage
    await fs.writeFile(filePath, file);
    
    // Return local URL
    return `/uploads/${filename}`;
  }

  async delete(key: string): Promise<void> {
    try {
      // Extract filename from key or URL
      const filename = key.includes('/uploads/') 
        ? key.split('/uploads/')[1]
        : key.split('/').pop() || key;
      
      const filePath = path.join(this.uploadDir, filename);
      await fs.unlink(filePath);
    } catch (error) {
      // Ignore errors if file doesn't exist
      console.warn('Failed to delete local file:', key, error);
    }
  }

  extractKey(url: string): string | null {
    try {
      if (url.startsWith('/uploads/')) {
        return url; // Return the URL as-is for local files
      }
      return null;
    } catch {
      return null;
    }
  }

  async getViewUrl(key: string): Promise<string> {
    // For local storage, just return the URL as-is
    if (key.startsWith('/uploads/')) {
      return key;
    }
    // If key is just the filename, prepend /uploads/
    return `/uploads/${key.split('/').pop()}`;
  }
}
