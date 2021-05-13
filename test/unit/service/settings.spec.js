const Service = require('service')
describe('Service', () => {
  describe('settings', () => {
    it('uses sensitive defaults', () => {
      expect(Service.settings).toEqual({
        endPoint: undefined,
        port: undefined,
        useSSL: true,
        accessKey: undefined,
        secretKey: undefined,
        region: undefined,
        sessionToken: undefined,
        s3HealthCheckInterval: 5000,
        s3ForcePathStyle: false,
        endPointIsString: false
      })
    })
  })
})
