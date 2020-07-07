import { EventEmitter } from '../src/helpers/eventEmitter'

describe('EventEmitter', () => {
  it('should correctly subscribe/unsubscribe on emitted events', () => {
    const emitter = new EventEmitter<string>()
    const callback = jest.fn()

    const unsubscribe = emitter.on('event', callback)
    emitter.emit('event')

    expect(callback.mock.calls.length).toEqual(1)

    unsubscribe()
    emitter.emit('event')

    expect(callback.mock.calls.length).toEqual(1)
  })
})
