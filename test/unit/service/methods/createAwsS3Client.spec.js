const Service = () => require('service')
describe('Service', () => {
  describe('methods', () => {
    describe('createAwsS3Client', () => {
      it('constructs a new S3 Client using aws endpoint', async () => {
        let service = Service()
        service.settings.accessKey = 'sadgds'
        service.settings.secretKey = 'dfgdfg'
        service.settings.region = 'sgegd'
        service.settings.endPointIsString = false
        const client = service.methods.createAwsS3Client.bind(service)()
        const credentials = await client.config.credentials()
        const endpoint = await client.config.endpoint()
        expect(client.constructor.name).toEqual('S3Client')
        expect(credentials.accessKeyId).toEqual(service.settings.accessKey)
        expect(credentials.secretAccessKey).toEqual(service.settings.secretKey)
        expect(endpoint.hostname).toEqual(`s3.${await client.config.region()}.amazonaws.com`)
        expect(await client.config.region()).toEqual(service.settings.region)
      })

      it('constructs a new S3 Client using non aws endpoint', async () => {
        let service = Service()
        service.settings.endPoint = 'http://localhost:4000'
        service.settings.accessKey = 'sadgds'
        service.settings.secretKey = 'dfgdfg'
        service.settings.region = 'sgegd'
        service.settings.endPointIsString = true
        const client = service.methods.createAwsS3Client.bind(service)()
        const credentials = await client.config.credentials()
        const endpoint = await client.config.endpoint()
        expect(client.constructor.name).toEqual('S3Client')
        expect(credentials.accessKeyId).toEqual(service.settings.accessKey)
        expect(credentials.secretAccessKey).toEqual(service.settings.secretKey)
        expect(endpoint.hostname).toEqual(`localhost`)
        expect(endpoint.port).toEqual(4000)
        expect(endpoint.protocol).toEqual(`http:`)
        expect(await client.config.region()).toEqual(service.settings.region)
      })
    })
  })
})
