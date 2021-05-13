const Service = () => require('service')
const Promise = require('bluebird')
describe('Service', () => {
  describe('actions', () => {
    describe('listIncompleteUploads', () => {
      it('lists all incomplete uploads in a Bucket', () => {
        let context = {
          listIncompleteUploadsQuery: jest.fn().mockReturnValue(Promise.resolve()),
          Promise
        }
        const bucketName = 'someBucket'
        const prefix = 'some-prefix'
        const recursive = true
        return Service()
          .actions.listIncompleteUploads.handler.bind(context)({
            params: { bucketName, prefix, recursive }
          })
          .then(r => {
            expect(context.listIncompleteUploadsQuery.mock.calls[0][0]).toEqual(bucketName)
            expect(context.listIncompleteUploadsQuery.mock.calls[0][1]).toEqual(prefix)
            expect(context.listIncompleteUploadsQuery.mock.calls[0][2]).toEqual(
              recursive ? '' : '/'
            )
          })
      })
    })
  })
})
