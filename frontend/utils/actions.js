async function deleteEntity(url, callback) {
  try {
    const response = await this.$axios.$delete(url)
    if (response.status === "success") {
      callback.call(this)
      return
    }
  } catch (error) {
    if (error.response) {
      this.errors = error.response.data
    } else if (error.request) {
      this.errors = {
        message: "Could not contact the server",
      }
    } else {
      this.errors = {
        message: error.message,
      }
    }
  }
}

module.exports = {
  deleteEntity
}
