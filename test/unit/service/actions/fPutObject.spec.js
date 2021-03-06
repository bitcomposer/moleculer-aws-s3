const Service = () => require('service')
const Promise = require('bluebird')
const { PutObjectCommand } = require('@aws-sdk/client-s3')
const { PassThrough } = require('stream')

jest.mock('fs')

const fs = require('fs')

describe('Service', () => {
  describe('actions', () => {
    describe('fPutObject', () => {
      it('accepts a bucket name, an object name and a file path', () => {
        const mockWriteable = new PassThrough()
        fs.createWriteStream.mockReturnValueOnce(mockWriteable)
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const filePath = './packages.PNG'
        const metaData = { foo: 'bar' }
        return Service()
          .actions.fPutObject.handler.bind(context)({
            params: { filePath, bucketName, objectName, metaData }
          })
          .then(r => {
            const fileStream = fs.createReadStream(filePath)
            const command = new PutObjectCommand({
              Bucket: bucketName,
              Key: objectName,
              Body: fileStream,
              Metadata: metaData
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
