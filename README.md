![Moleculer logo](http://moleculer.services/images/banner.png)

[![Build Status](https://travis-ci.org/bitcomposer/moleculer-aws-s3.svg?branch=master)](https://travis-ci.org/bitcomposer/moleculer-aws-s3)
[![Coverage Status](https://coveralls.io/repos/github/bitcomposer/moleculer-aws-s3/badge.svg?branch=master)](https://coveralls.io/github/bitcomposer/moleculer-aws-s3?branch=master)
[![Known Vulnerabilities](https://snyk.io/test/github/bitcomposer/moleculer-aws-s3/badge.svg)](https://snyk.io/test/github/bitcomposer/moleculer-aws-s3)

# moleculer-aws-s3 [![NPM version](https://img.shields.io/npm/v/moleculer-aws-s3.svg)](https://www.npmjs.com/package/moleculer-aws-s3)

An aws s3 sdk wrapper as a service for the moleculer framework

## Features

The following List details which features are implemented

- Bucket Management (Create, Delete, List)
- Object Management (Put, List, Delete, Stat)
- Presigned URL Management (Generate presigned URLs and Post Policy signed URLs)

## Install

```
npm install moleculer-aws-s3 --save
```

## Usage

## Settings

<!-- AUTO-CONTENT-START:SETTINGS -->

| Property                | Type      | Default      | Description                                                                                                                                                                 |
| ----------------------- | --------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `endPoint`              | `String`  | **required** | The Hostname s3 is running on and available at. Hostname or IP-Address                                                                                                      |
| `port`                  | `Number`  | **required** | TCP/IP port number s3 is listening on. Default value set to 80 for HTTP and 443 for HTTPs.                                                                                  |
| `useSSL`                | `Boolean` | `null`       | If set to true, https is used instead of http. Default is true.                                                                                                             |
| `accessKey`             | `String`  | **required** | The AccessKey to use when connecting to s3                                                                                                                                  |
| `secretKey`             | `String`  | **required** | The SecretKey to use when connecting to s3                                                                                                                                  |
| `region`                | `String`  | `null`       | Set this value to override region cache                                                                                                                                     |
| `sessionToken`          | `String`  | `null`       | Set this value to provide x-amz-security-token (AWS S3 specific). (Optional)                                                                                                |
| `s3HealthCheckInterval` | `Number`  | `null`       | This service will perform a periodic healthcheck of s3. Use this setting to configure the inverval in which the healthcheck is performed. Set to `0` to turn healthcheks of |
| `s3ForcePathStyle`      | `Boolean` | `null`       | If set to true, path style is used instead of virtual host style. Default is false.                                                                                         |
| `endPointIsString`      | `Boolean` | `null`       | If set to true, the endpoint is set as is. Default is false.                                                                                                                |

<!-- AUTO-CONTENT-END:SETTINGS -->

<!-- AUTO-CONTENT-TEMPLATE:SETTINGS
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each this}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^this}}
*No settings.*
{{/this}}

-->

## Actions

<!-- AUTO-CONTENT-START:ACTIONS -->

## `makeBucket`

Creates a new Bucket

### Parameters

| Property     | Type     | Default      | Description                                                 |
| ------------ | -------- | ------------ | ----------------------------------------------------------- |
| `bucketName` | `string` | **required** | The name of the bucket                                      |
| `region`     | `string` | **required** | The region to create the bucket in. Defaults to "us-east-1" |

### Results

**Type:** `PromiseLike.<(undefined|Error)>`

## `listBuckets`

Lists all buckets.

### Parameters

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |

_No input parameters._

### Results

**Type:** `PromiseLike.<(Array.<Bucket>|Error)>`

## `bucketExists`

Checks if a bucket exists.

### Parameters

| Property     | Type     | Default      | Description        |
| ------------ | -------- | ------------ | ------------------ |
| `bucketName` | `string` | **required** | Name of the bucket |

### Results

**Type:** `PromiseLike.<(boolean|Error)>`

## `removeBucket`

Removes a bucket.

### Parameters

| Property     | Type     | Default      | Description        |
| ------------ | -------- | ------------ | ------------------ |
| `bucketName` | `string` | **required** | Name of the bucket |

### Results

**Type:** `PromiseLike.<(boolean|Error)>`

## `listObjects`

Lists all objects in a bucket.

### Parameters

| Property     | Type      | Default      | Description                                                                                                                         |
| ------------ | --------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `bucketName` | `string`  | **required** | Name of the bucket                                                                                                                  |
| `prefix`     | `string`  | **required** | The prefix of the objects that should be listed (optional, default '').                                                             |
| `recursive`  | `boolean` | **required** | `true` indicates recursive style listing and false indicates directory style listing delimited by '/'. (optional, default `false`). |

### Results

**Type:** `PromiseLike.<(Array.<Object>|Error)>`

## `listObjectsV2`

Lists all objects in a bucket using S3 listing objects V2 API

### Parameters

| Property     | Type      | Default      | Description                                                                                                                         |
| ------------ | --------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `bucketName` | `string`  | **required** | Name of the bucket                                                                                                                  |
| `prefix`     | `string`  | **required** | The prefix of the objects that should be listed (optional, default '').                                                             |
| `recursive`  | `boolean` | **required** | `true` indicates recursive style listing and false indicates directory style listing delimited by '/'. (optional, default `false`). |
| `startAfter` | `string`  | **required** | Specifies the object name to start after when listing objects in a bucket. (optional, default '').                                  |

### Results

**Type:** `PromiseLike.<(Array.<Object>|Error)>`

## `listIncompleteUploads`

Lists partially uploaded objects in a bucket.

### Parameters

| Property     | Type      | Default      | Description                                                                                                                         |
| ------------ | --------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| `bucketName` | `string`  | **required** | Name of the bucket                                                                                                                  |
| `prefix`     | `string`  | **required** | The prefix of the objects that should be listed (optional, default '').                                                             |
| `recursive`  | `boolean` | **required** | `true` indicates recursive style listing and false indicates directory style listing delimited by '/'. (optional, default `false`). |

### Results

**Type:** `PromiseLike.<(Array.<Object>|Error)>`

## `getObject`

Downloads an object as a stream.

### Parameters

| Property     | Type     | Default      | Description         |
| ------------ | -------- | ------------ | ------------------- |
| `bucketName` | `string` | **required** | Name of the bucket  |
| `objectName` | `string` | **required** | Name of the object. |

### Results

**Type:** `PromiseLike.<(ReadableStream|Error)>`

## `getPartialObject`

Downloads the specified range bytes of an object as a stream.

### Parameters

| Property     | Type     | Default      | Description                                                                                                                       |
| ------------ | -------- | ------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `bucketName` | `string` | **required** | Name of the bucket.                                                                                                               |
| `objectName` | `string` | **required** | Name of the object.                                                                                                               |
| `offset`     | `number` | **required** | `offset` of the object from where the stream will start.                                                                          |
| `length`     | `number` | **required** | `length` of the object that will be read in the stream (optional, if not specified we read the rest of the file from the offset). |

### Results

**Type:** `PromiseLike.<(ReadableStream|Error)>`

## `fGetObject`

Downloads and saves the object as a file in the local filesystem.

### Parameters

| Property     | Type     | Default      | Description                                                            |
| ------------ | -------- | ------------ | ---------------------------------------------------------------------- |
| `bucketName` | `string` | **required** | Name of the bucket.                                                    |
| `objectName` | `string` | **required** | Name of the object.                                                    |
| `filePath`   | `string` | **required** | Path on the local filesystem to which the object data will be written. |

### Results

**Type:** `PromiseLike.<(undefined|Error)>`

## `putObject`

Uploads an object from a stream/Buffer.

### Parameters

| Property     | Type             | Default      | Description                        |
| ------------ | ---------------- | ------------ | ---------------------------------- |
| `params`     | `ReadableStream` | **required** | Readable stream.                   |
| `bucketName` | `string`         | **required** | Name of the bucket.                |
| `objectName` | `string`         | **required** | Name of the object.                |
| `size`       | `number`         | **required** | Size of the object (optional).     |
| `metaData`   | `object`         | **required** | metaData of the object (optional). |

### Results

**Type:** `PromiseLike.<(undefined|Error)>`

## `fPutObject`

Uploads contents from a file to objectName.

### Parameters

| Property     | Type     | Default      | Description                        |
| ------------ | -------- | ------------ | ---------------------------------- |
| `bucketName` | `string` | **required** | Name of the bucket.                |
| `objectName` | `string` | **required** | Name of the object.                |
| `filePath`   | `string` | **required** | Path of the file to be uploaded.   |
| `metaData`   | `object` | **required** | metaData of the object (optional). |

### Results

**Type:** `PromiseLike.<(undefined|Error)>`

## `copyObject`

Copy a source object into a new object in the specified bucket.

### Parameters

| Property       | Type     | Default      | Description                                             |
| -------------- | -------- | ------------ | ------------------------------------------------------- |
| `bucketName`   | `string` | **required** | Name of the bucket.                                     |
| `objectName`   | `string` | **required** | Name of the object.                                     |
| `sourceObject` | `string` | **required** | Path of the file to be copied.                          |
| `conditions`   | `object` | **required** | Conditions to be satisfied before allowing object copy. |
| `metaData`     | `object` | **required** | metaData of the object (optional).                      |

### Results

**Type:** `PromiseLike.<({etag: {string}, lastModified: {string}}|Error)>`

## `statObject`

Gets metadata of an object.

### Parameters

| Property     | Type     | Default      | Description         |
| ------------ | -------- | ------------ | ------------------- |
| `bucketName` | `string` | **required** | Name of the bucket. |
| `objectName` | `string` | **required** | Name of the object. |

### Results

**Type:** `PromiseLike.<({size: {number}, metaData: {object}, lastModified: {string}, etag: {string}}|Error)>`

## `removeObject`

Removes an Object

### Parameters

| Property     | Type     | Default      | Description         |
| ------------ | -------- | ------------ | ------------------- |
| `bucketName` | `string` | **required** | Name of the bucket. |
| `objectName` | `string` | **required** | Name of the object. |

### Results

**Type:** `PromiseLike.<(undefined|Error)>`

## `removeObjects`

Removes a list of Objects

### Parameters

| Property      | Type             | Default      | Description           |
| ------------- | ---------------- | ------------ | --------------------- |
| `bucketName`  | `string`         | **required** | Name of the bucket.   |
| `objectNames` | `Array.<string>` | **required** | Names of the objects. |

### Results

**Type:** `PromiseLike.<(undefined|Error)>`

## `removeIncompleteUpload`

Removes a partially uploaded object.

### Parameters

| Property     | Type     | Default      | Description         |
| ------------ | -------- | ------------ | ------------------- |
| `bucketName` | `string` | **required** | Name of the bucket. |
| `objectName` | `string` | **required** | Name of the object. |

### Results

**Type:** `PromiseLike.<(undefined|Error)>`

## `presignedGetObject`

Generates a presigned URL for HTTP GET operations. Browsers/Mobile clients may point to this URL to directly download objects even if the bucket is private. This presigned URL can have an
associated expiration time in seconds after which the URL is no longer valid. The default value is 7 days.

### Parameters

| Property      | Type     | Default      | Description                                                                     |
| ------------- | -------- | ------------ | ------------------------------------------------------------------------------- |
| `bucketName`  | `string` | **required** | Name of the bucket.                                                             |
| `objectName`  | `string` | **required** | Name of the object.                                                             |
| `expires`     | `number` | **required** | Expiry time in seconds. Default value is 7 days. (optional)                     |
| `reqParams`   | `object` | **required** | request parameters. (optional)                                                  |
| `requestDate` | `string` | **required** | An ISO date string, the url will be issued at. Default value is now. (optional) |

### Results

**Type:** `PromiseLike.<(String|Error)>`

## `presignedPutObject`

Generates a presigned URL for HTTP PUT operations. Browsers/Mobile clients may point to this URL to upload objects directly to a bucket even if it is private. This presigned URL can have
an associated expiration time in seconds after which the URL is no longer valid. The default value is 7 days.

### Parameters

| Property     | Type     | Default      | Description                                                 |
| ------------ | -------- | ------------ | ----------------------------------------------------------- |
| `bucketName` | `string` | **required** | Name of the bucket.                                         |
| `objectName` | `string` | **required** | Name of the object.                                         |
| `expires`    | `number` | **required** | Expiry time in seconds. Default value is 7 days. (optional) |

### Results

**Type:** `PromiseLike.<(String|Error)>`

## `presignedPostPolicy`

Allows setting policy conditions to a presigned URL for POST operations. Policies such as bucket name to receive object uploads, key name prefixes, expiry policy may be set.

### Parameters

| Property | Type     | Default      | Description                                       |
| -------- | -------- | ------------ | ------------------------------------------------- |
| `policy` | `object` | **required** | Policy object created by s3Client.newPostPolicy() |

### Results

**Type:** `PromiseLike.<({postURL: {string}, formData: {object}}|Error)>`

<!-- AUTO-CONTENT-END:ACTIONS -->

<!-- AUTO-CONTENT-TEMPLATE:ACTIONS
{{#each this}}
## `{{name}}` {{#each badges}}{{this}} {{/each}}
{{#since}}
_<sup>Since: {{this}}</sup>_
{{/since}}

{{description}}

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each params}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^params}}
*No input parameters.*
{{/params}}

{{#returns}}
### Results
**Type:** {{type}}

{{description}}
{{/returns}}

{{#hasExamples}}
### Examples
{{#each examples}}
{{this}}
{{/each}}
{{/hasExamples}}

{{/each}}
-->

# Methods

<!-- AUTO-CONTENT-START:METHODS -->

## `createAwsS3Client`

Creates and returns a new S3 client

### Parameters

| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |

_No input parameters._

### Results

**Type:** `Client`

## `ping`

Pings the configured S3 backend

### Parameters

| Property  | Type     | Default      | Description                                       |
| --------- | -------- | ------------ | ------------------------------------------------- |
| `timeout` | `number` | **required** | Amount of miliseconds to wait for a ping response |

### Results

**Type:** `PromiseLike.<(boolean|S3PingError)>`

## `listIncompleteUploadsQuery`

Gets a list of incomplete uploads

### Parameters

| Property         | Type     | Default      | Description                                       |
| ---------------- | -------- | ------------ | ------------------------------------------------- |
| `bucketName`     | `string` | **required** | Amount of miliseconds to wait for a ping response |
| `prefix`         | `string` | **required** | Amount of miliseconds to wait for a ping response |
| `keyMarker`      | `string` | **required** | Amount of miliseconds to wait for a ping response |
| `uploadIdMarker` | `string` | **required** | Amount of miliseconds to wait for a ping response |
| `delimiter`      | `string` | **required** | Amount of miliseconds to wait for a ping response |

### Results

**Type:** `PromiseLike.<Array.<Object>>`

<!-- AUTO-CONTENT-END:METHODS -->

<!-- AUTO-CONTENT-TEMPLATE:METHODS
{{#each this}}
## `{{name}}` {{#each badges}}{{this}} {{/each}}
{{#since}}
_<sup>Since: {{this}}</sup>_
{{/since}}

{{description}}

### Parameters
| Property | Type | Default | Description |
| -------- | ---- | ------- | ----------- |
{{#each params}}
| `{{name}}` | {{type}} | {{defaultValue}} | {{description}} |
{{/each}}
{{^params}}
*No input parameters.*
{{/params}}

{{#returns}}
### Results
**Type:** {{type}}

{{description}}
{{/returns}}

{{#hasExamples}}
### Examples
{{#each examples}}
{{this}}
{{/each}}
{{/hasExamples}}

{{/each}}
-->

## Test

```
$ npm test
```

In development with watching

```
$ npm run ci
```

## Contribution

Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License

The project is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact

Copyright (c) 2021 Kenneth Shepherd

[![@MoleculerJS](https://img.shields.io/badge/github-moleculerjs-green.svg)](https://github.com/moleculerjs) [![@MoleculerJS](https://img.shields.io/badge/twitter-MoleculerJS-blue.svg)](https://twitter.com/MoleculerJS)
