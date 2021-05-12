const { S3InitializationError } = require('errors')

describe('Errors', () => {
  describe('S3InitializationError', () => {
    describe('constructor', () => {
      it('constructs with sensitive defaults', () => {
        let error = new S3InitializationError()
        expect(error.message).toEqual('S3 can not be initialized')
        expect(error.code).toEqual(500)
        expect(error.type).toEqual('S3_INITIALIZATION_ERROR')
        expect(error.data).toEqual({})
        expect(error.retryable).toEqual(false)
      })

      it('constructs with given arguments', () => {
        let error = new S3InitializationError('foo', 500, 'BAR', { fooz: 'barz' })
        expect(error.message).toEqual('foo')
        expect(error.code).toEqual(500)
        expect(error.type).toEqual('BAR')
        expect(error.data).toEqual({ fooz: 'barz' })
        expect(error.retryable).toEqual(false)
      })
    })
  })
})
