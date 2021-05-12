const Service = () => require('service')
describe('Service', () => {
  describe('methods', () => {
    describe('createAwsS3Client', () => {
      it('constructs a new S3 Client', () => {
        let service = Service()
        service.settings.endPoint = 'dfght'
        service.settings.port = 12345
        service.settings.useSSL = false
        service.settings.accessKey = 'sadgds'
        service.settings.secretKey = 'dfgdfg'
        service.settings.region = 'sgegd'
        service.settings.transport = { foo: 'bar' }
        const client = service.methods.createAwsS3Client.bind(service)()
        expect(client.constructor.name).toEqual('Client')
        expect(client.accessKey).toEqual(service.settings.accessKey)
        expect(client.secretKey).toEqual(service.settings.secretKey)
        expect(client.host).toEqual(service.settings.endPoint)
        expect(client.port).toEqual(service.settings.port)
        expect(client.protocol).toEqual('http:')
        expect(client.region).toEqual(service.settings.region)
        expect(client.transport).toEqual(service.settings.transport)
      })
    })
  })
})
