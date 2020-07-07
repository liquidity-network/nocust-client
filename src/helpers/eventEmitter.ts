// Simple event emitter
export class EventEmitter<T> {
  private listeners: Map<T, Function[]> = new Map()

  on(event: T, callback: Function): Function {
    if (!this.listeners.get(event)) this.listeners.set(event, [])
    this.listeners.get(event).push(callback)
    return () => {
      const listeners = this.listeners.get(event)
      if (listeners) {
        this.listeners.set(
          event,
          listeners.filter(cb => cb !== callback),
        )
      }
    }
  }

  once(event: T, callback: Function) {
    const unsubscribe = this.on(event, (...args: any[]) => {
      unsubscribe()
      callback(...args)
    })
    return unsubscribe
  }

  emit(event: T, ...args: any[]) {
    const listeners = this.listeners.get(event)
    if (listeners) listeners.forEach(f => f(...args))
  }

  removeEventAllListeners() {
    this.listeners = new Map<T, Function[]>()
  }
}
