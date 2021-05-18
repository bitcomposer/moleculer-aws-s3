'use strict'

const { ServiceBroker } = require('moleculer')
const AwsS3Service = require('./..')

// Create broker
let broker = new ServiceBroker({
  name: 'aws-s3',
  logger: console,
  transporter: 'nats://s3.devmonkey.uk:4222'
})

broker.loadService(__dirname + '/file-api.service.js')

// Load services
broker.createService({
  name: 'aws-s3',
  mixins: AwsS3Service,
  settings: {
    endPoint: 'http://s3.devmonkey.uk:9000',
    region: 'us-east-1',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin',
    endPointIsString: true,
    s3ForcePathStyle: true
  }
})

process.once('SIGUSR2', function () {
  broker.stop().then(() => {
    process.kill(process.pid, 'SIGUSR2')
  })
})

// Start server
broker.start().then(() => broker.repl())
