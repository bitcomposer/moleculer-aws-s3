'use strict'

const multer = require('multer')
const fs = require('fs')
const nodeRes = require('node-res')
const { ServiceBroker } = require('moleculer')
const ApiGatewayService = require('moleculer-web')

const upload = multer({ dest: '/var/tmp/' })

// Create broker
let broker = new ServiceBroker({
  name: 'api',
  nodeID: 'api-node',
  logger: console,
  logLevel: 'trace',
  tracing: true,
  transporter: 'TCP', //'nats://localhost:4222',
  serializer: 'Notepack'
})

// Load services
broker.createService({
  mixins: ApiGatewayService,
  settings: {
    path: '/',
    port: 5000,
    routes: [
      {
        path: '/upload',
        authentication: true,
        mappingPolicy: 'restrict',
        aliases: {
          'POST /putObject': 'stream:file.putObject'
        },
        bodyParsers: {
          json: false,
          urlencoded: false
        }
      },
      {
        path: '/api',
        whitelist: [
          // Access any actions in 'file' service
          'file.*'
        ],
        bodyParsers: {
          json: true
        }
      }
    ]
  },
  methods: {
    /**
     * Authenticate a route
     *
     * @param ctx The context
     * @param _ The router settings
     * @param req The request that is being authenticated
     */
    authenticate: async function (ctx, _, req) {
      const route = this.getRouteFromReq(req)

      ctx.meta.rawHeaders = req.headers

      ctx.meta.bucketName = req.headers?.bucketname
      ctx.meta.objectName = req.headers?.objectname
      ctx.meta.size = req.headers?.size

      return null
    },
    /**
     * Get the route from the passed request
     *
     * @param req The request to get the route from
     *
     * @returns The route that is being requested
     */
    getRouteFromReq: function (req) {
      return req.parsedUrl.replace(req.baseUrl, '')
    }
  }
})

process.once('SIGUSR2', function () {
  broker.stop().then(() => {
    process.kill(process.pid, 'SIGUSR2')
  })
})

// Start server
broker
  .start()
  .then(() => broker.repl())
  .catch(err => broker.logger.error(err))
