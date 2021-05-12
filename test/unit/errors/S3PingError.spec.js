const { S3PingError } = require('errors')

describe('Errors', () => {
  describe('S3PingError', () => {
    describe('constructor', () => {
      it('constructs with sensitive defaults', () => {
        let error = new S3PingError()
        expect(error.message).toEqual('S3 Backend not reachable')
        expect(error.code).toEqual(502)
        expect(error.type).toEqual('S3_PING_ERROR')
        expect(error.data).toEqual({})
        expect(error.retryable).toEqual(true)
      })

      it('constructs with given arguments', () => {
        let error = new S3PingError('foo', 500, 'BAR', { fooz: 'barz' })
        expect(error.message).toEqual('foo')
        expect(error.code).toEqual(500)
        expect(error.type).toEqual('BAR')
        expect(error.data).toEqual({ fooz: 'barz' })
        expect(error.retryable).toEqual(true)
      })
    })
  })
})
