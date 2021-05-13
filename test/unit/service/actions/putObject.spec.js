const Service = () => require('service')
const Promise = require('bluebird')
const { PutObjectCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('putObject', () => {
      it('accepts a bucket name, an object name and a file path', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const size = 1535
        const metaData = { foo: 'bar' }
        const stream = { fooz: 'barz' }
        return Service()
          .actions.putObject.handler.bind(context)({
            params: stream,
            meta: { bucketName, objectName, size, metaData }
          })
          .then(r => {
            const command = new PutObjectCommand({
              Bucket: bucketName,
              Key: objectName,
              Body: stream,
              Metadata: metaData,
              ContentLength: size
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
