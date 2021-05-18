'use strict'

const { ServiceBroker } = require('moleculer')
const AwsS3Service = require('./..')

// Create broker
let broker = new ServiceBroker({
  logger: console,
  transporter: 'nats://nats:4222'
})

// Load services
broker.createService({
  mixins: AwsS3Service,
  settings: {
    endPoint: 'http://s3.devmonkey.uk:9000',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
  }
})

process.once('SIGUSR2', function () {
  broker.stop().then(() => {
    process.kill(process.pid, 'SIGUSR2')
  })
})

// Start server
broker.start().then(() => broker.repl())
