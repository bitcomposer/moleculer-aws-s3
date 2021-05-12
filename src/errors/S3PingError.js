const { MoleculerRetryableError } = require('moleculer/src/errors')

/**
 * Error that should be thrown when the S3 Backend can not be pinged
 *
 * @class S3PingError
 * @extends {MoleculerRetryableError}
 */
module.exports = class S3PingError extends MoleculerRetryableError {
  /**
   * Creates an instance of S3PingError.
   *
   * @param {String?} message
   * @param {Number?} code
   * @param {String?} type
   * @param {any} data
   *
   * @memberof S3PingError
   */
  constructor(message = 'S3 Backend not reachable', code = 502, type = 'S3_PING_ERROR', data = {}) {
    super(message)
    this.code = code
    this.type = type
    this.data = data
  }
}
