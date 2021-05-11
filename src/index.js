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
  DeleteBucketCommand,
  AbortMultipartUploadRequest,
  GetObjectCommand,
  CopyObjectCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import fs from 'fs'
import {
  extractMetadata,
  prependXAMZMeta,
  isValidPrefix,
  isValidEndpoint,
  isValidBucketName,
  isValidPort,
  isValidObjectName,
  isAmazonEndpoint,
  getScope,
  uriEscape,
  uriResourceEscape,
  isBoolean,
  isFunction,
  isNumber,
  isString,
  isObject,
  isArray,
  isValidDate,
  pipesetup,
  readableStream,
  isReadableStream,
  isVirtualHostStyle,
  insertContentType,
  makeDateLong,
  promisify,
  getVersionId,
  sanitizeETag,
  RETENTION_MODES,
  RETENTION_VALIDITY_UNITS
} from './helpers.js'
import _ from 'lodash'
import { S3PingError, S3InitializationError } from './errors'

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
        const { bucketName, prefix, recursive } = ctc.params
        const keyMarker = ''
        const uploadIdMarker = ''
        const delimiter = recursive ? '' : '/'

        return this.listIncompleteUploadsQuery(
          bucketName,
          prefix,
          keyMarker,
          uploadIdMarker,
          delimiter
        )
      }
    },
    /**
     * Downloads an object as a stream.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket
     * @param {string} objectName - Name of the object.
     *
     * @returns {PromiseLike<ReadableStream|Error>}
     */
    getObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' }
      },
      async handler(ctx) {
        return this.client.send(
          new GetObjectCommand({
            Bucket: ctx.params.bucketName,
            Key: ctx.params.objectName
          })
        )
      }
    },
    /**
     * Downloads the specified range bytes of an object as a stream.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {number} offset - `offset` of the object from where the stream will start.
     * @param {number} length - `length` of the object that will be read in the stream (optional, if not specified we read the rest of the file from the offset).
     *
     * @returns {PromiseLike<ReadableStream|Error>}
     */
    getPartialObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' },
        offset: { type: 'number' },
        length: { type: 'number', optional: true }
      },
      handler(ctx) {
        const { offset, length, bucketName, objectName } = ctx.params
        let range = ''

        if (offset || length) {
          if (offset) {
            range = `bytes=${+offset}-`
          } else {
            range = 'bytes=0-'
            offset = 0
          }

          if (length) {
            range += `${+length + offset - 1}`
          }
        }
        return this.client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: objectName,
            Range: range
          })
        )
      }
    },
    /**
     * Downloads and saves the object as a file in the local filesystem.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {string} filePath - Path on the local filesystem to which the object data will be written.
     *
     * @returns {PromiseLike<undefined|Error>}
     */
    fGetObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' },
        filePath: { type: 'string' }
      },
      async handler(ctx) {
        const { bucketName, objectName, filePath } = ctx.params
        const { Body } = await this.client.send(
          new GetObjectCommand({
            Bucket: bucketName,
            Key: objectName
          })
        )

        return new Promise((resolve, reject) => {
          Body.pipe(fs.createWriteStream(filePath))
            .on('error', err => reject(err))
            .on('close', () => resolve())
        })
      }
    },
    /**
     * Uploads an object from a stream/Buffer.
     *
     * @actions
     * @param {ReadableStream} params - Readable stream.
     *
     * @meta
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {number} size - Size of the object (optional).
     * @param {object} metaData - metaData of the object (optional).
     *
     * @returns {PromiseLike<undefined|Error>}
     */
    putObject: {
      handler(ctx) {
        return this.Promise.resolve({
          stream: ctx.params,
          meta: ctx.meta
        }).then(({ stream, meta }) =>
          this.client.send(
            new PutObjectCommand({
              Bucket: meta.bucketName,
              Key: meta.objectName,
              Body: stream,
              Metadata: meta.metaData,
              ContentLength: meta.size
            })
          )
        )
      }
    },
    /**
     * Uploads contents from a file to objectName.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {string} filePath - Path of the file to be uploaded.
     * @param {object} metaData - metaData of the object (optional).
     *
     * @returns {PromiseLike<undefined|Error>}
     */
    fPutObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' },
        filePath: { type: 'string' },
        metaData: { type: 'object', optional: true }
      },
      handler(ctx) {
        const { bucketName, objectName, filePath, metaData } = ctx.params
        const fileStream = fs.createReadStream(filePath)
        // TODO - Handle large uploads as mmultipart if necessary.  Need to check if PutObjectCommand handles them anyway as I have read something that alluded to that but it may be wishful thinking.

        return this.client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: objectName,
            Body: fileStream,
            Metadata: metaData
          })
        )
      }
    },
    /**
     * Copy a source object into a new object in the specified bucket.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {string} sourceObject - Path of the file to be copied.
     * @param {object} conditions - Conditions to be satisfied before allowing object copy.
     * @param {object} metaData - metaData of the object (optional).
     *
     * @returns {PromiseLike<{etag: {string}, lastModified: {string}}|Error>}
     */
    copyObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' },
        sourceObject: { type: 'string' },
        conditions: {
          type: 'object',
          properties: {
            modified: { type: 'string', optional: true },
            unmodified: { type: 'string', optional: true },
            matchETag: { type: 'string', optional: true },
            matchETagExcept: { type: 'string', optional: true }
          }
        },
        metaData: { type: 'object', optional: true }
      },
      handler(ctx) {
        const { bucketName, objectName, sourceObject, conditions, metaData } = ctx.params
        return this.client.send(
          new CopyObjectCommand({
            Bucket: bucketName,
            Key: objectName,
            CopySource: sourceObject,
            MetaData: metaData,
            CopySourceIfMatch: conditions?.matchETag,
            CopySourceIfModifiedSince: conditions?.modified,
            CopySourceIfNoneMatch: conditions?.matchETagExcept,
            CopySourceIfUnmodifiedSince: conditions?.unmodified
          })
        )
      }
    },
    /**
     * Gets metadata of an object.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     *
     * @returns {PromiseLike<{size: {number}, metaData: {object}, lastModified: {string}, etag: {string}}|Error>}
     */
    statObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' }
      },
      handler(ctx) {
        return this.client.send(
          new HeadObjectCommand({
            Bucket: ctx.params.bucketName,
            Key: ctx.params.objectName
          })
        )
      }
    },
    /**
     * Removes an Object
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     *
     * @returns {PromiseLike<undefined|Error>}
     */
    removeObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' }
      },
      handler(ctx) {
        return this.client.send(
          new DeleteObjectCommand({
            Bucket: ctx.params.bucketName,
            Key: ctx.params.objectName
          })
        )
      }
    },
    /**
     * Removes a list of Objects
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string[]} objectNames - Names of the objects.
     *
     * @returns {PromiseLike<undefined|Error>}
     */
    removeObjects: {
      params: {
        bucketName: { type: 'string' },
        objectNames: { type: 'array', items: 'string' }
      },
      handler(ctx) {
        return this.client.send(
          new DeleteObjectsCommand({
            Bucket: ctx.params.bucketName,
            Delete: {
              Objects: ctx.params.objectNames
            }
          })
        )
      }
    },
    /**
     * Removes a partially uploaded object.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     *
     * @returns {PromiseLike<undefined|Error>}
     */
    removeIncompleteUpload: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' }
      },
      async handler(ctx) {
        const { bucketName, objectName } = ctc.params
        const keyMarker = ''
        const uploadIdMarker = ''
        const delimiter = '/'

        // list the uploads
        const uploads = await this.listIncompleteUploadsQuery(
          bucketName,
          objectName,
          keyMarker,
          uploadIdMarker,
          delimiter
        )
        const deleteKeys = _map(uploads, 'Key')
        return this.client.send(
          new DeleteObjectsCommand({
            Bucket: ctx.params.bucketName,
            Delete: {
              Objects: deleteKeys
            }
          })
        )
      }
    },
    /**
     * Generates a presigned URL for the provided HTTP method, 'httpMethod'. Browsers/Mobile clients may point to this URL to directly download objects even if the bucket is private. This
     * presigned URL can have an associated expiration time in seconds after which the URL is no longer valid. The default value is 7 days.
     *
     * @actions
     * @param {string} httpMethod - The HTTP-Method (eg. `GET`).
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {number} expires - Expiry time in seconds. Default value is 7 days. (optional)
     * @param {object} reqParams - request parameters. (optional)
     * @param {string} requestDate - An ISO date string, the url will be issued at. Default value is now. (optional)
     * @returns {PromiseLike<String|Error>}
     */
    presignedUrl: {
      params: {
        httpMethod: { type: 'string' },
        bucketName: { type: 'string' },
        objectName: { type: 'string' },
        expires: { type: 'number', integer: true, optional: true },
        reqParams: { type: 'object', optional: true },
        requestDate: { type: 'string', optional: true }
      },
      handler(ctx) {
        return this.Promise.resolve(ctx.params).then(
          ({ httpMethod, bucketName, objectName, expires, reqParams, requestDate }) => {
            if (isString(requestDate)) {
              requestDate = new Date(requestDate)
            }

            return new this.Promise((resolve, reject) => {
              this.client.presignedUrl(
                httpMethod,
                bucketName,
                objectName,
                expires,
                reqParams,
                requestDate,
                (error, url) => {
                  if (error) {
                    reject(error)
                  } else {
                    resolve(url)
                  }
                }
              )
            })
          }
        )
      }
    },
    /**
     * Generates a presigned URL for HTTP GET operations. Browsers/Mobile clients may point to this URL to directly download objects even if the bucket is private. This presigned URL can have an
     * associated expiration time in seconds after which the URL is no longer valid. The default value is 7 days.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {number} expires - Expiry time in seconds. Default value is 7 days. (optional)
     * @param {object} reqParams - request parameters. (optional)
     * @param {string} requestDate - An ISO date string, the url will be issued at. Default value is now. (optional)
     * @returns {PromiseLike<String|Error>}
     */
    presignedGetObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' },
        expires: { type: 'number', integer: true, optional: true },
        reqParams: { type: 'object', optional: true },
        requestDate: { type: 'string', optional: true }
      },
      handler(ctx) {
        const { bucketName, objectName, expires, reqParams, requestDate } = ctx.params
        const command = new GetObjectCommand({
          Bucket: bucketName,
          Key: objectName
        })

        if (isFunction(reqParams)) {
          reqParams = {}
          requestDate = new Date()
        }

        var validRespHeaders = [
          'response-content-type',
          'response-content-language',
          'response-expires',
          'response-cache-control',
          'response-content-disposition',
          'response-content-encoding'
        ]
        validRespHeaders.forEach(header => {
          if (
            reqParams !== undefined &&
            reqParams[header] !== undefined &&
            !isString(reqParams[header])
          ) {
            throw new TypeError(`response header ${header} should be of type "string"`)
          }
        })

        return getSignedUrl(this.client, command, {
          expiresIn: expires ?? 3600,
          signingDate: requestDate ?? new Date(),
          signableHeaders: reqParams
        })
      }
    },
    /**
     * Generates a presigned URL for HTTP PUT operations. Browsers/Mobile clients may point to this URL to upload objects directly to a bucket even if it is private. This presigned URL can have
     * an associated expiration time in seconds after which the URL is no longer valid. The default value is 7 days.
     *
     * @actions
     * @param {string} bucketName - Name of the bucket.
     * @param {string} objectName - Name of the object.
     * @param {number} expires - Expiry time in seconds. Default value is 7 days. (optional)
     * @returns {PromiseLike<String|Error>}
     */
    presignedPutObject: {
      params: {
        bucketName: { type: 'string' },
        objectName: { type: 'string' },
        expires: { type: 'number', integer: true, optional: true }
      },
      handler(ctx) {
        const { bucketName, objectName, expires } = ctx.params
        const command = new PutObjectCommand({
          Bucket: bucketName,
          Key: objectName
        })

        return getSignedUrl(this.client, command, {
          expiresIn: expires ?? 3600
        })
      }
    },
    /**
     * Allows setting policy conditions to a presigned URL for POST operations. Policies such as bucket name to receive object uploads, key name prefixes, expiry policy may be set.
     *
     * @actions
     * @param {object} policy - Policy object created by minioClient.newPostPolicy()
     * @returns {PromiseLike<{postURL: {string}, formData: {object}}|Error>}
     */
    presignedPostPolicy: {
      params: {
        policy: {
          type: 'object',
          properties: {
            expires: { type: 'string', optional: true },
            key: { type: 'string', optional: true },
            keyStartsWith: { type: 'string', optional: true },
            bucket: { type: 'string', optional: true },
            contentType: { type: 'string', optional: true },
            contentLengthRangeMin: { type: 'number', integer: true, optional: true },
            contentLengthRangeMax: { type: 'number', integer: true, optional: true }
          }
        }
      },
      handler(ctx) {
        const { policy } = ctx.params

        return this.Promise.resolve(ctx.params).then(({ policy }) => {
          const _policy = this.client.newPostPolicy()
          if (policy.expires) {
            _policy.setExpires(new Date(policy.expires))
          }
          if (policy.key) {
            _policy.setKey(policy.key)
          }
          if (policy.keyStartsWith) {
            _policy.setKeyStartsWith(policy.keyStartsWith)
          }
          if (policy.bucket) {
            _policy.setBucket(policy.bucket)
          }
          if (policy.contentType) {
            _policy.setContentType(policy.contentType)
          }
          if (policy.contentLengthRangeMin && policy.contentLengthRangeMax) {
            _policy.setContentLengthRange(
              policy.contentLengthRangeMin,
              policy.contentLengthRangeMax
            )
          }
          return this.client.presignedPostPolicy(_policy)
        })
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
          throw new S3PingError()
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
    },

    async listIncompleteUploadsQuery(bucketName, prefix, keyMarker, uploadIdMarker, delimiter) {
      if (!isValidBucketName(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName)
      }
      if (!isString(prefix)) {
        throw new TypeError('prefix should be of type "string"')
      }
      if (!isString(keyMarker)) {
        throw new TypeError('keyMarker should be of type "string"')
      }
      if (!isString(uploadIdMarker)) {
        throw new TypeError('uploadIdMarker should be of type "string"')
      }
      if (!isString(delimiter)) {
        throw new TypeError('delimiter should be of type "string"')
      }

      let truncated = true
      let objectList = []
      const params = {
        Bucket: bucketName,
        KeyMarker: keyMarker,
        Prefix: prefix,
        UploadIdMarker: uploadIdMarker,
        Delimiter: delimiter
      }

      do {
        const res = await this.client.send(new ListMultipartUploadsCommand(params))
        params.KeyMarker = res.NextKeyMarker
        params.UploadIdMarker = res.NextUploadIdMarker
        truncated = res.IsTruncated
        objectList = objectList.concat(res.Uploads)
      } while (truncated)

      return objectList
    },

    async findUploadId(bucketName, objectName) {
      if (!isValidBucketName(bucketName)) {
        throw new errors.InvalidBucketNameError('Invalid bucket name: ' + bucketName)
      }
      if (!isValidObjectName(objectName)) {
        throw new errors.InvalidObjectNameError(`Invalid object name: ${objectName}`)
      }
      if (!isFunction(cb)) {
        throw new TypeError('cb should be of type "function"')
      }
      var latestUpload
      const result = await this.listIncompleteUploadsQuery(bucketName, objectName, '', '', '')

      result.forEach(upload => {
        if (upload.key === objectName) {
          if (!latestUpload || upload.initiated.getTime() > latestUpload.initiated.getTime()) {
            latestUpload = upload
            return
          }
        }
      })

      return latestUpload?.uploadId
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
