const Service = () => require('service')
const Promise = require('bluebird')
const { ListObjectsV2Command } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('listObjectsV2', () => {
      it('lists all objects in a Bucket - v2', () => {
        let stream = {
          Contents: [{ foo: 'bar' }]
        }
        let context = {
          client: {
            send: jest.fn().mockReturnValue(stream)
          },
          Promise
        }
        const bucketName = 'someBucket'
        const prefix = 'some-prefix'
        const startAfter = 'that'
        const recursive = true
        return Service()
          .actions.listObjectsV2.handler.bind(context)({
            params: { bucketName, prefix, recursive, startAfter }
          })
          .then(r => {
            const params = {
              Bucket: bucketName,
              Prefix: prefix,
              StartAfter: startAfter,
              Delimiter: recursive ? '' : '/'
            }
            const command = new ListObjectsV2Command(params)
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
            expect(r).toEqual([{ foo: 'bar' }])
          })
      })

      it('assumes prefix and recursive if not given - v2', () => {
        let stream = {
          Contents: [{ foo: 'bar' }]
        }
        let context = {
          client: {
            send: jest.fn().mockReturnValue(stream)
          },
          Promise
        }
        const bucketName = 'someBucket'

        return Service()
          .actions.listObjectsV2.handler.bind(context)({ params: { bucketName } })
          .then(r => {
            const params = {
              Bucket: bucketName,
              Delimiter: '/'
            }
            const command = new ListObjectsV2Command(params)
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
            expect(r).toEqual([{ foo: 'bar' }])
          })
      })
    })
  })
})
