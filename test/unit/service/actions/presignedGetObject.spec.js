const Service = () => require('service')
const Promise = require('bluebird')
const { GetObjectCommand } = require('@aws-sdk/client-s3')

const url = 'https://example.com'

const mockGetSignedUrl = jest.fn().mockReturnValue(Promise.resolve(url))
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: mockGetSignedUrl
}))

describe('Service', () => {
  describe('actions', () => {
    describe('presignedUrl', () => {
      it('creates and returns a Presigned URL for obtaining an Object', () => {
        let context = {
          presignerClient: {},
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const expires = 1535
        const reqParams = { 'response-content-type': 'bar' }
        const requestDate = 'Mon, 01 Jan 2018 00:00:00 GMT'
        const expectedParams = {
          expiresIn: expires,
          signingDate: requestDate
        }

        return Service()
          .actions.presignedGetObject.handler.bind(context)({
            params: {
              bucketName,
              objectName,
              expires,
              reqParams,
              requestDate
            }
          })
          .then(r => {
            const command = new GetObjectCommand({
              Bucket: bucketName,
              Key: objectName,
              ResponseContentType: 'bar'
            })
            expect(r).toEqual(url)
            expect(JSON.stringify(mockGetSignedUrl.mock.calls[0][0])).toBe(
              JSON.stringify(context.presignerClient)
            )
            expect(JSON.stringify(mockGetSignedUrl.mock.calls[0][1])).toBe(JSON.stringify(command))
            expect(JSON.stringify(mockGetSignedUrl.mock.calls[0][2])).toBe(
              JSON.stringify(expectedParams)
            )
          })
      })

      it('rejects with errors encountered', async () => {
        let context = {
          presignerClient: {},
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const expires = 1535
        const reqParams = { 'response-content-type': 2333 }

        await expect(() => {
          return Service().actions.presignedGetObject.handler.bind(context)({
            params: {
              bucketName,
              objectName,
              expires,
              reqParams
            }
          })
        }).rejects.toThrow(TypeError)
      })
    })
  })
})
