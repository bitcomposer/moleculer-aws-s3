const Service = () => require('service')
const Promise = require('bluebird')
const { HeadBucketCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('bucketExists', () => {
      it('checks if the bucket exists', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve(true))
          },
          Promise
        }
        const bucketName = 'someBucket'
        return Service()
          .actions.bucketExists.handler.bind(context)({ params: { bucketName } })
          .then(r => {
            const command = new HeadBucketCommand({
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
