const { MoleculerError } = require('moleculer/src/errors')

/**
 * Error that should be thrown when the S3 Service can not be Initialized
 *
 * @class S3InitializationError
 * @extends {MoleculerError}
 */
module.exports = class S3InitializationError extends MoleculerError {
  /**
   * Creates an instance of S3InitializationError.
   *
   * @param {String?} message
   * @param {Number?} code
   * @param {String?} type
   * @param {any} data
   *
   * @memberof S3InitializationError
   */
  constructor(
    message = 'S3 can not be initialized',
    code = 500,
    type = 'S3_INITIALIZATION_ERROR',
    data = {}
  ) {
    super(message)
    this.code = code
    this.type = type
    this.data = data
  }
}
