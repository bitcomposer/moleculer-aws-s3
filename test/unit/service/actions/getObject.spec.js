const Service = () => require('service')
const Promise = require('bluebird')
const { GetObjectCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('getObject', () => {
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
          .actions.getObject.handler.bind(context)({ params: { bucketName, objectName } })
          .then(r => {
            const command = new GetObjectCommand({
              Bucket: bucketName,
              Key: objectName
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toEqual(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
