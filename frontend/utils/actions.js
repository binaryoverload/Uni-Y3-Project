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

async function deletePolicyItem() {
  const result = await this.$swal({
    icon: "warning",
    title: "Are you sure?",
    html: `Are you sure you want to delete the policy item <span class="text-indigo-700">#${this.item.policy_order
      } (${this.item.type.toTitle()})</span>? This action is irreversible.`,
    confirmButtonText: "Delete",
    showCancelButton: true,
    focusConfirm: false,
    focusCancel: true,
  })
  if (!result.isConfirmed) {
    return
  }
  deleteEntity.call(
    this,
    `/policy-items/${this.item.id}`,
    function () {
      this.$swal({
        icon: "success",
        title: "Deleted token!",
        html: `Successfully delete the policy item <span class="text-indigo-700">#${this.item.policy_order}</span>.`,
      })
      this.$nuxt.refresh()
    }.bind(this)
  )
}

module.exports = {
  deleteEntity,
  deletePolicyItem
}
