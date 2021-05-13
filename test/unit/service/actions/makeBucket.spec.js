const Service = () => require('service')
const Promise = require('bluebird')
const { CreateBucketCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('makeBucket', () => {
      it('accepts a bucket name and a region', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const region = 'some-region'
        return Service()
          .actions.makeBucket.handler.bind(context)({ params: { bucketName, region } })
          .then(r => {
            const command = new CreateBucketCommand({
              Bucket: bucketName,
              CreateBucketConfiguration: {
                LocationConstraint: region
              }
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })

      it('uses an empty string as the default region', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        return Service()
          .actions.makeBucket.handler.bind(context)({ params: { bucketName } })
          .then(r => {
            const command = new CreateBucketCommand({
              Bucket: bucketName,
              CreateBucketConfiguration: {
                LocationConstraint: ''
              }
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
