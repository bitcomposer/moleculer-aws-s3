'use strict'

const { ServiceBroker } = require('moleculer')
const AwsS3Service = require('../../index')

// Create broker
let broker = new ServiceBroker({
  name: 'file',
  nodeID: 'aws-s3-node',
  logger: console,
  tracing: true,
  logLevel: 'trace',
  transporter: 'TCP', //'nats://localhost:4222',
  serializer: 'Notepack'
})

// Load services
broker.createService({
  name: 'file',
  mixins: AwsS3Service,
  settings: {
    endPoint: 'http://s3.devmonkey.uk',
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
