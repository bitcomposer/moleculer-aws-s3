const Service = () => require('service')
const Promise = require('bluebird')
const { DeleteBucketCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('removeBucket', () => {
      it('removes a Bucket', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve(true))
          },
          Promise
        }
        const bucketName = 'someBucket'
        return Service()
          .actions.removeBucket.handler.bind(context)({ params: { bucketName } })
          .then(r => {
            const command = new DeleteBucketCommand({
              Bucket: bucketName
            })
            expect(r).toEqual(true)
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
