const Service = () => require('service')
describe('Service', () => {
  describe('created', () => {
    it('constructs a new s3 client', () => {
      let context = {
        createAwsS3Client: jest.fn().mockReturnValue({ foo: 'bar' })
      }
      let service = Service()
      service.created.bind(context)()
      expect(context.client).toEqual({ foo: 'bar' })
    })
  })
})
