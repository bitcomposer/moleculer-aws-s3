const Service = require('service')
describe('Service', () => {
  describe('name', () => {
    it('uses a sensitive default', () => {
      expect(Service.name).toEqual('aws-s3')
    })
  })
})
