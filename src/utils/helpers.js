// check if typeof arg string
const isString = function (arg) {
  return typeof arg === 'string'
}

const isValidBucketName = function (bucket) {
  if (!isString(bucket)) return false

  // bucket length should be less than and no more than 63
  // characters long.
  if (bucket.length < 3 || bucket.length > 63) {
    return false
  }
  // bucket with successive periods is invalid.
  if (bucket.indexOf('..') > -1) {
    return false
  }
  // bucket cannot have ip address style.
  if (bucket.match(/[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+/)) {
    return false
  }
  // bucket should begin with alphabet/number and end with alphabet/number,
  // with alphabet/number/.- in the middle.
  if (bucket.match(/^[a-z0-9][a-z0-9.-]+[a-z0-9]$/)) {
    return true
  }
  return false
}
// check if typeof arg function
const isFunction = function (arg) {
  return typeof arg === 'function'
}
// check if prefix is valid
const isValidPrefix = function (prefix) {
  if (!isString(prefix)) return false
  if (prefix.length > 1024) return false
  return true
}
// check if objectName is a valid object name
const isValidObjectName = function (objectName) {
  if (!isValidPrefix(objectName)) return false
  if (objectName.length === 0) return false
  return true
}

module.exports = {
  isString,
  isValidBucketName,
  isFunction,
  isValidPrefix,
  isValidObjectName
}
