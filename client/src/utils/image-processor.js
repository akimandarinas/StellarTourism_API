/**
 * Utility functions for processing images.
 */

/**
 * Generates a placeholder image URL.
 *
 * This function creates a URL for a placeholder image based on the given width and height.
 * It's important that this function does *not* prepend "/public/" to the image path,
 * as the image server should handle serving static assets correctly.
 *
 * @param {number} width - The desired width of the placeholder image.
 * @param {number} height - The desired height of the placeholder image.
 * @returns {string} The URL of the placeholder image.
 */
export const generatePlaceholderImageUrl = (width, height) => {
  // Example implementation using a service like placeholder.com
  return `https://via.placeholder.com/${width}x${height}`
}

/**
 * Resizes an image (implementation not provided).
 *
 * This function is a placeholder for image resizing functionality.  In a real
 * application, this would involve using a library like sharp or canvas to
 * manipulate the image data.
 *
 * @param {File} imageFile - The image file to resize.
 * @param {number} maxWidth - The maximum width of the resized image.
 * @param {number} maxHeight - The maximum height of the resized image.
 * @returns {Promise<File>} A promise that resolves with the resized image file.
 */
export const resizeImage = async (imageFile, maxWidth, maxHeight) => {
  // In a real implementation, you would use a library like sharp or canvas
  // to resize the image.  This is just a placeholder.
  return new Promise((resolve, reject) => {
    reject(new Error("Image resizing not implemented."))
  })
}

/**
 * Converts a File object to a base64 encoded string.
 *
 * @param {File} file - The file to convert.
 * @returns {Promise<string>} A promise that resolves with the base64 encoded string.
 */
export const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
