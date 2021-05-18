const Service = () => require('service')
const Promise = require('bluebird')
const { GetObjectCommand } = require('@aws-sdk/client-s3')
const { PassThrough } = require('stream')

describe('Service', () => {
  afterAll(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  describe('actions', () => {
    describe('fGetObject', () => {
      it('accepts a bucket name, an object name and a file path', async done => {
        const mockReadStream = new PassThrough()

        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve({ Body: mockReadStream }))
          },
          streamToFile: jest.fn().mockReturnValue(Promise.resolve()),
          Promise
        }

        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const filePath = 'c:/temp/packages.txt'
        return Service()
          .actions.fGetObject.handler.bind(context)({
            params: { bucketName, objectName, filePath }
          })
          .then(r => {
            const command = new GetObjectCommand({
              Bucket: bucketName,
              Key: objectName
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
            expect(context.streamToFile.mock.calls[0][0]).toBe(mockReadStream)
            expect(context.streamToFile.mock.calls[0][1]).toBe(filePath)

            done()
          })
      })
    })
  })
})
