const Service = require('../../src/service')

class GreeterService extends Service {
  constructor(broker) {
    super(broker)

    this.parseServiceSchema({
      name: 'file-api',
      version: 'v2',
      meta: {
        scalable: true
      },

      settings: {
        routes: [
          {
            path: '/upload',
            authentication: false,
            aliases: {
              'PUT /putObject': 'stream:aws-s3.putObject'
            }
          },
          {
            path: '/',
            whitelist: [
              // Access any actions in 'minio' service
              'aws-s3.*'
            ],
            bodyParsers: {
              json: true
            }
          }
        ]
      },
      actions: {},
      events: {},
      created: this.serviceCreated,
      started: this.serviceStarted,
      stopped: this.serviceStopped
    })
  }

  // Event handler
  userCreated(user) {
    this.broker.call('mail.send', { user })
  }

  serviceCreated() {
    this.logger.info('ES6 Service created.')
  }

  serviceStarted() {
    this.logger.info('ES6 Service started.')
  }

  serviceStopped() {
    this.logger.info('ES6 Service stopped.')
  }
}

module.exports = GreeterService
