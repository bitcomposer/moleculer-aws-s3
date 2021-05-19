const Service = () => require('service')
const Promise = require('bluebird')
const { ListBucketsCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('bucketExists', () => {
      it('checks if the bucket exists', () => {
        const bucketName = 'someBucket'
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve({ Buckets: [{ Name: bucketName }] }))
          },
          Promise
        }

        return Service()
          .actions.bucketExists.handler.bind(context)({ params: { bucketName } })
          .then(r => {
            const command = new ListBucketsCommand({})
            expect(r).toEqual(true)
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
