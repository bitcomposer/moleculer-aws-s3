const Service = () => require('service')
const Promise = require('bluebird')
describe('Service', () => {
  describe('actions', () => {
    describe('listBuckets', () => {
      it('returns an empty string if there are no buckets', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve())
          },
          Promise
        }
        return Service()
          .actions.listBuckets.handler.bind(context)()
          .then(r => {
            expect(r).toEqual([])
          })
      })

      it('uses an empty string as the default region', () => {
        let context = {
          client: {
            send: jest.fn().mockReturnValue(Promise.resolve({ Buckets: ['foo'] }))
          },
          Promise
        }
        return Service()
          .actions.listBuckets.handler.bind(context)()
          .then(r => {
            expect(r).toEqual(['foo'])
          })
      })
    })
  })
})
