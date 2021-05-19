const Service = () => require('service')
const Promise = require('bluebird')
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('removeIncompleteUpload', () => {
      it('accepts a bucket name and an object name', () => {
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          listIncompleteUploadsQuery: jest
            .fn()
            .mockReturnValue(Promise.resolve([{ Key: objectName, Value: objectName }])),
          Promise
        }

        return Service()
          .actions.removeIncompleteUpload.handler.bind(context)({
            params: { bucketName, objectName }
          })
          .then(r => {
            const command = new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: [{ Key: objectName, Value: objectName }]
              }
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toEqual(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
