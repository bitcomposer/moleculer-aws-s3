const Service = () => require('service')
const Promise = require('bluebird')
const { DeleteObjectsCommand } = require('@aws-sdk/client-s3')
const _ = require('lodash')

describe('Service', () => {
  describe('actions', () => {
    describe('removeObjects', () => {
      it('accepts a bucket name and an object name', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const objectNames = ['some-object']
        return Service()
          .actions.removeObjects.handler.bind(context)({ params: { bucketName, objectNames } })
          .then(r => {
            const mappedObjectNames = _.map(objectNames, obj => {
              return { Key: obj }
            })
            const command = new DeleteObjectsCommand({
              Bucket: bucketName,
              Delete: {
                Objects: mappedObjectNames
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
