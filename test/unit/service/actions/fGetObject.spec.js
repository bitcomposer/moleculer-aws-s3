const Service = () => require('service')
const Promise = require('bluebird')
const { GetObjectCommand } = require('@aws-sdk/client-s3')

jest.mock('fs')

const fs = require('fs')

describe('Service', () => {
  afterAll(() => {
    jest.resetAllMocks()
    jest.clearAllMocks()
  })
  describe('actions', () => {
    describe('fGetObject', () => {
      it('accepts a bucket name, an object name and a file path', () => {
        const mockWriteStream = {
          on: jest.fn().mockImplementation(function (_this, event, handler) {
            if (event === 'error') {
              handler()
            }
            return _this
          })
        }

        const mockReadStream = {
          pipe: jest.fn().mockReturnValue(Promise.resolve(mockWriteStream))
        }

        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve({ Body: mockReadStream }))
          },
          Promise
        }

        fs.createWriteStream.mockReturnValue(Promise.resolve(mockWriteStream))

        //mocked(createWriteStream).mockReturnValueOnce(mockWriteStream)

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
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toEqual(
              JSON.stringify(command)
            )
            expect(mockReadStream.pipe).toBeCalledTimes(1)
          })
      })
    })
  })
})
