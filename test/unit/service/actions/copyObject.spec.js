const Service = () => require('service')
const Promise = require('bluebird')
const { CopyObjectCommand } = require('@aws-sdk/client-s3')

describe('Service', () => {
  describe('actions', () => {
    describe('copyObject', () => {
      it('accepts a bucket name, an object name, a sourceObject and conditions', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const sourceObject = 'c:/temp/packages.PNG'
        const metaData = {}
        const conditions = {
          modified: 'Mon, 01 Jan 2018 00:00:00 GMT',
          unmodified: 'Tue, 01 Jan 2019 00:00:00 GMT',
          matchETag: 'asdgdf',
          matchETagExcept: 'asdgdf'
        }
        return Service()
          .actions.copyObject.handler.bind(context)({
            params: { sourceObject, bucketName, objectName, conditions, metaData }
          })
          .then(r => {
            const command = new CopyObjectCommand({
              Bucket: bucketName,
              Key: objectName,
              CopySource: sourceObject,
              MetaData: metaData,
              CopySourceIfMatch: conditions?.matchETag,
              CopySourceIfModifiedSince: conditions?.modified,
              CopySourceIfNoneMatch: conditions?.matchETagExcept,
              CopySourceIfUnmodifiedSince: conditions?.unmodified
            })
            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })

      it('works without any conditions', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        const bucketName = 'some-bucket'
        const objectName = 'some-object'
        const sourceObject = 'c:/temp/packages.PNG'
        const conditions = {}
        const metaData = {}
        return Service()
          .actions.copyObject.handler.bind(context)({
            params: { sourceObject, bucketName, objectName, conditions, metaData }
          })
          .then(r => {
            const command = new CopyObjectCommand({
              Bucket: bucketName,
              Key: objectName,
              CopySource: sourceObject,
              MetaData: metaData,
              CopySourceIfMatch: conditions?.matchETag,
              CopySourceIfModifiedSince: conditions?.modified,
              CopySourceIfNoneMatch: conditions?.matchETagExcept,
              CopySourceIfUnmodifiedSince: conditions?.unmodified
            })

            expect(JSON.stringify(context.client.send.mock.calls[0][0])).toBe(
              JSON.stringify(command)
            )
          })
      })
    })
  })
})
