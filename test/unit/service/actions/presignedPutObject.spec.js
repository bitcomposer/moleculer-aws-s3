const Service = () => require('service')
const Promise = require('bluebird')
const { PutObjectCommand } = require('@aws-sdk/client-s3')

const url = 'https://example.com'

describe('Service', () => {
  describe('actions', () => {
    describe('presignedUrl', () => {
      it('creates and returns a Presigned URL for creating an Object', () => {
        jest.clearAllMocks()
        const mockGetSignedUrl = jest.fn().mockReturnValue(Promise.resolve(url))
        jest.mock('@aws-sdk/s3-request-presigner', () => ({
          getSignedUrl: mockGetSignedUrl
        }))

        let context = {
          client: {},
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const expires = 1535
        const expectedParams = {
          expiresIn: expires
        }
        let creating = Service().actions.presignedPutObject.handler.bind(context)({
          params: {
            bucketName,
            objectName,
            expires
          }
        })
        return Promise.delay(100)
          .then(() => creating)
          .then(r => {
            const command = new PutObjectCommand({
              Bucket: bucketName,
              Key: objectName
            })

            expect(r).toEqual(url)
            expect(JSON.stringify(mockGetSignedUrl.mock.calls[0][0])).toBe(
              JSON.stringify(context.client)
            )
            expect(JSON.stringify(mockGetSignedUrl.mock.calls[0][1])).toBe(JSON.stringify(command))
            expect(JSON.stringify(mockGetSignedUrl.mock.calls[0][2])).toBe(
              JSON.stringify(expectedParams)
            )
          })
      })
    })
  })
})
