import { StorageEngine } from '../src/services/storage'

const localStorage = require('node-persist')
const path = require('path')

export const fsStorage: StorageEngine = {
  async init() {
    await localStorage.init({ dir: path.resolve(__dirname, './.node-persist') })
  },
  async get(key: string): Promise<string> {
    return localStorage.getItem(key)
  },
  async set(key: string, value: string): Promise<boolean> {
    await localStorage.setItem(key, value)
    return true
  },
  async delete(key: string): Promise<boolean> {
    await localStorage.setItem(key, undefined)
    return true
  },
}
