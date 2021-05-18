const Service = require('service')
const Promise = require('bluebird')
const { PassThrough } = require('stream')

jest.mock('fs')

const fs = require('fs')

describe('Service', () => {
  describe('methods', () => {
    describe('streamToFile', () => {
      it('rejects with an error if a stream error occurs', async () => {
        const filePath = 'c:/temp/packages.txt'
        const mockReadStream = new PassThrough()
        const mockWriteable = new PassThrough()
        const mockError = new Error('You crossed the streams!')

        fs.createWriteStream.mockReturnValueOnce(mockWriteable)

        // Act
        const actualPromise = Service.methods.streamToFile(mockReadStream, filePath)
        setTimeout(() => {
          mockReadStream.emit('error', mockError)
        }, 100)

        // Assert
        await expect(actualPromise).rejects.toEqual(mockError)
      })
      it('resolves if the data writes successfully', async () => {
        // Arrange
        const mockReadable = new PassThrough()
        const mockWriteable = new PassThrough()
        const mockFilePath = 'c:/temp/packages.txt'
        const mockError = new Error('You crossed the streams!')
        fs.createWriteStream.mockReturnValueOnce(mockWriteable)

        // Act
        const actualPromise = Service.methods.streamToFile(mockReadable, mockFilePath)

        setTimeout(() => {
          mockReadable.emit('data', 'beep!')
          mockReadable.emit('data', 'boop!')
          mockReadable.emit('end')
        }, 100)

        // Assert
        await expect(actualPromise).resolves.toEqual(undefined)
      })
    })
  })
})
