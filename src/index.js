/*
 * moleculer-aws-s3
 * Copyright (c) 2021 Kenneth Shepherd (https://github.com/bitcomposer/moleculer-aws-s3)
 * MIT Licensed
 */

'use strict'

import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  ListObjectsV2Command,
  ListBucketsCommand,
  HeadBucketCommand,
  DeleteBucketCommand
} from '@aws-sdk/client-s3'

module.exports = {
  name: 'aws-s3',

  /**
   * Default settings
   */
  settings: {
    /** @type {String} The Hostname s3 is running on and available at. Hostname or IP-Address */
    endPoint: undefined,
    /** @type {Number} TCP/IP port number s3 is listening on. Default value set to 80 for HTTP and 443 for HTTPs.*/
    port: undefined,
    /** @type {Boolean?} If set to true, https is used instead of http. Default is true.*/
    useSSL: true,
    /** @type {String} The AccessKey to use when connecting to s3 */
    accessKey: undefined,
    /** @type {String} The SecretKey to use when connecting to s3 */
    secretKey: undefined,
    /** @type {String?} Set this value to override region cache*/
    region: undefined,
    /** @type {String?} Set this value to pass in a custom transport. (Optional)*/
    transport: undefined,
    /** @type {String?} Set this value to provide x-amz-security-token (AWS S3 specific). (Optional)*/
    sessionToken: undefined,
    /** @type {Number?} This service will perform a periodic healthcheck of s3. Use this setting to configure the inverval in which the healthcheck is performed. Set to `0` to turn healthcheks of */
    s3HealthCheckInterval: 5000,
    /** @type {Boolean?} If set to true, path style is used instead of virtual host style. Default is false.*/
    s3ForcePathStyle: false
  },

  /**
   * Actions
   */
  actions: {
    /**
     * Creates a new Bucket
     *
     * @actions
     *
     * @param {string} bucketName - The name of the bucket
     * @param {string} region - The region to create the bucket in. Defaults to "us-east-1"
     *
     * @returns {PromiseLike<undefined|Error>}
     */
    makeBucket: {
      params: {
        bucketName: { type: 'string' },
        region: { type: 'string', optional: true }
      },
      async handler(ctx) {
        return this.client.send(
          new CreateBucketCommand({
            Bucket: ctx.params.bucketName,
            CreateBucketConfiguration: {
              LocationConstraint: ctx.params.region ?? ''
            }
          })
        )
      }
    },
    /**
     * Lists all buckets.
     *
     * @actions
     *
     * @returns {PromiseLike<Bucket[]|Error>}
     */
    listBuckets: {
      handler() {
        return this.client
          .send(new ListBucketsCommand({}))
          .then(buckets => (isUndefined(buckets) ? [] : buckets))
      }
    },
    /**
     * Checks if a bucket exists.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket
     *
     * @returns {PromiseLike<boolean|Error>}
     */
    bucketExists: {
      params: {
        bucketName: { type: 'string' }
      },
      async handler(ctx) {
        try {
          await this.client.send(
            new HeadBucketCommand({
              Bucket: ctx.params.bucketName
            })
          )
          return true
        } catch (err) {
          if (err.statusCode >= 400 && err.statusCode < 500) {
            return false
          }
          throw err
        }
      }
    },
    /**
     * Removes a bucket.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket
     *
     * @returns {PromiseLike<boolean|Error>}
     */
    removeBucket: {
      params: {
        bucketName: { type: 'string' }
      },
      async handler(ctx) {
        return this.client.send(
          new DeleteBucketCommand({
            Bucket: ctx.params.bucketName
          })
        )
      }
    },

    /**
     * Lists all objects in a bucket using S3 listing objects V2 API
     *
     * @actions
     * @param {string} bucketName - Name of the bucket
     * @param {string} prefix - The prefix of the objects that should be listed (optional, default '').
     * @param {boolean} recursive - `true` indicates recursive style listing and false indicates directory style listing delimited by '/'. (optional, default `false`).
     * @param {string} startAfter - Specifies the object name to start after when listing objects in a bucket. (optional, default '').
     *
     * @returns {PromiseLike<Object[]|Error>}
     */
    listObjects: {
      params: {
        bucketName: { type: 'string' },
        prefix: { type: 'string', optional: true },
        recursive: { type: 'boolean', optional: true },
        startAfter: { type: 'string', optional: true }
      },
      async handler(ctx) {
        let objectList = []
        const params = {
          Bucket: ctx.params.bucketName,
          Prefix: ctx.params.prefix,
          StartAfter: ctx.params.startAfter,
          Delimiter: ctx.params.recursive ? '' : '/',
          ContinuationToken: undefined
        }

        do {
          const res = await this.client.send(new ListObjectsV2Command(params))
          params.ContinuationToken = res.NextContinuationToken
          objectList = objectList.concat(res.Contents)
        } while (params.ContinuationToken !== undefined)

        return objectList
      }
    },
    /**
     * Lists partially uploaded objects in a bucket.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket
     * @param {string} prefix - The prefix of the objects that should be listed (optional, default '').
     * @param {boolean} recursive - `true` indicates recursive style listing and false indicates directory style listing delimited by '/'. (optional, default `false`).
     *
     * @returns {PromiseLike<Object[]|Error>}
     */
    listIncompleteUploads: {
      params: {
        bucketName: { type: 'string' },
        prefix: { type: 'string', optional: true },
        recursive: { type: 'boolean', optional: true }
      },
      handler(ctx) {
        return this.Promise.resolve(ctx.params).then(
          ({ bucketName, prefix = '', recursive = false }) => {
            return new this.Promise((resolve, reject) => {
              try {
                const stream = this.client.listIncompleteUploads(bucketName, prefix, recursive)
                const objects = []
                stream.on('data', el => objects.push(el))
                stream.on('end', () => resolve(objects))
                stream.on('error', reject)
              } catch (e) {
                reject(e)
              }
            })
          }
        )
      }
    }
  },

  /**
   * Methods
   */
  methods: {
    /**
     * Creates and returns a new Minio client
     *
     * @methods
     *
     * @returns {Client}
     */
    createAwsS3Client() {
      const endpoint

      if (this.settings.endPoint) {
        enpoint = {
          hostname: this.settings.endPoint,
          port: this.settings.port,
          protocol: this.settings.useSSL ? 'https' : 'http'
        }
      }

      const credentials = {
        accessKeyId: this.settings.accessKey,
        secretAccessKey: this.settings.secretKey
      }

      const s3 = new S3Client({
        // Let the aws lib sort out the endpoint if we are using amz aws.
        endpoint: endpoint,
        credentials,
        region: this.settings.region,
        signatureVersion: 'v4',
        forcePathStyle: this.setting.s3ForcePathStyle
      })
      return s3
    },
    /**
     * Pings the configured minio backend
     *
     * @param {number} timeout - Amount of miliseconds to wait for a ping response
     * @returns {PromiseLike<boolean|S3PingError>}
     */
    ping({ timeout = 5000 } = {}) {
      return this.Promise.race([
        this.client.listBuckets().then(() => true),
        this.Promise.delay(timeout).then(() => {
          throw new MinioPingError()
        })
      ])
    },

    async getAllKeys(params, allKeys = []) {
      const response = await this.client.send(new ListObjectsV2Command(params))
      response.Contents.forEach(obj => allKeys.push(obj.Key))

      if (response.NextContinuationToken) {
        params.ContinuationToken = response.NextContinuationToken
        await getAllKeys(params, allKeys) // RECURSIVE CALL
      }
      return allKeys
    }
  },

  /**
   * Service created lifecycle event handler
   */
  created() {
    this.client = this.createAwsS3Client()
  },

  /**
   * Service started lifecycle event handler
   */
  started() {
    return this.Promise.resolve()
      .then(() => this.ping())
      .then(() => {
        this.settings.s3HealthCheckInterval
          ? (this.healthCheckInterval = setInterval(
              () => this.ping().catch(e => this.logger.error('S3 backend can not be reached', e)),
              this.settings.s3HealthCheckInterval
            ))
          : undefined
        return undefined
      })
      .catch(e => {
        throw new S3InitializationError(e.message)
      })
  },

  /**
   * Service stopped lifecycle event handler
   */
  stopped() {
    this.healthCheckInterval && clearInterval(this.healthCheckInterval)
  }
}
