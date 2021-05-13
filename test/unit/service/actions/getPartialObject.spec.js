const Service = () => require('service')
const Promise = require('bluebird')
const { GetObjectCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('getPartialObject', () => {
      it('accepts a bucket name, an object name, an offest and a length', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const offset = 0
        const length = 100
        return Service()
          .actions.getPartialObject.handler.bind(context)({
            params: { bucketName, objectName, offset, length }
          })
          .then(r => {
            let range = ''
            let offsetWrk = offset
            let lengthWrk = length

            if (offsetWrk || lengthWrk) {
              if (offsetWrk) {
                range = `bytes=${+offsetWrk}-`
              } else {
                range = 'bytes=0-'
                offsetWrk = 0
              }

              if (lengthWrk) {
                range += `${+lengthWrk + offsetWrk - 1}`
              }
            }
            const command = new GetObjectCommand({
              Bucket: bucketName,
              Key: objectName,
              Range: range
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toEqual(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
