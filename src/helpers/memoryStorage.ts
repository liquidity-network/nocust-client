import { StorageEngine } from '../services/storage'

// To be used for testing purposes only.
// Real application should use persistent storage!
export const memoryStorage: StorageEngine = {
  storage: {},
  async get(key: string): Promise<string> {
    return this.storage[key]
  },
  async set(key: string, value: string): Promise<boolean> {
    this.storage[key] = value
    return true
  },
  async delete(key: string): Promise<boolean> {
    delete this.storage[key]
    return true
  },
}
