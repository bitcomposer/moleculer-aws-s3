const Service = () => require('service')
const Promise = require('bluebird')
const { HeadObjectCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('statObject', () => {
      it('accepts a bucket name and an object name', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        return Service()
          .actions.statObject.handler.bind(context)({ params: { bucketName, objectName } })
          .then(r => {
            const command = new HeadObjectCommand({
              Bucket: bucketName,
              Key: objectName
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
