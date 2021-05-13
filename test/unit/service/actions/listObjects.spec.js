const Service = () => require('service')
const Promise = require('bluebird')
const { ListObjectsCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('listObjects', () => {
      it('lists all objects in a Bucket', () => {
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
        const recursive = true
        return Service()
          .actions.listObjects.handler.bind(context)({ params: { bucketName, prefix, recursive } })
          .then(r => {
            const params = {
              Bucket: bucketName,
              Marker: undefined,
              Prefix: prefix,
              Delimiter: recursive ? '' : '/'
            }
            const command = new ListObjectsCommand(params)
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
            expect(r).toEqual([{ foo: 'bar' }])
          })
      })

      it('assumes prefix and recursive if not given', () => {
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
          .actions.listObjects.handler.bind(context)({ params: { bucketName } })
          .then(r => {
            const params = {
              Bucket: bucketName,
              Delimiter: '/'
            }
            const command = new ListObjectsCommand(params)
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
            expect(r).toEqual([{ foo: 'bar' }])
          })
      })
    })
  })
})
