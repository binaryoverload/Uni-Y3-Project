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

async function resetUserPassword(userData) {
  const result = await this.$swal({
    icon: "question",
    title: "Are you sure?",
    html: `Are you sure you want to reset the password for <span class="text-indigo-700">${userData.username}</span>? This action is irreversible.`,
    confirmButtonText: "Reset Password",
    showCancelButton: true,
    focusConfirm: false,
    focusCancel: true,
  })
  if (!result.isConfirmed) {
    return
  }

  if (userData.username === this.$auth.user.username) {
    const result = await this.$swal({
      icon: "warning",
      title: "Are you sure?",
      text: "Are you sure you want to reset your password? This action will log you out!",
      confirmButtonText: "I'm sure",
      showCancelButton: true,
      focusConfirm: false,
      focusCancel: true,
    })
    if (!result.isConfirmed) {
      return
    }
  }

  try {
    const result = await fetch("https://www.dinopass.com/password/simple", {
      method: "get",
    })
    if (!result.ok) {
      throw Error()
    }
    const password = await result.text()
    const response = await this.$axios.$patch(
      `/users/${userData.id}`,
      {
        username: userData.username,
        password: password,
        first_name: userData.first_name,
        last_name: userData.last_name,
      }
    )
    if (response.status === "success") {
      this.$swal({
        icon: "success",
        title: "Password regenerated!",
        html: `Password for user <span class="text-indigo-700">${userData.username}</span> has been reset to: <input value="${password}" class="inline-block py-1 font-mono text-center" spellcheck="false"/>`,
      })
    }
  } catch (error) {
    let message = "Something went wrong"
    if (error.request) {
      message = "Could not contact the server"
    } else {
      message = error.message
    }
    this.$swal({
      icon: "error",
      title: "Could not regenerate password",
      text: message,
    })
  }
}

async function copyToken(token) {
  try {
    await navigator.clipboard.writeText(token)
    await this.$swal({
      icon: "success",
      timerProgressBar: true,
      showConfirmButton: false,
      title: "Copied token!",
      text: `Successfully copied the token to your clipboard`,
      timer: 1500,
      toast: true,
      position: "top-end"
    })
  } catch (e) {
    await this.$swal({
      icon: "error",
      title: "Could not copy token",
      text: e.message
    })
  }
}

async function copyPassword(password) {
  try {
    await navigator.clipboard.writeText(password)
    await this.$swal({
      icon: "success",
      timerProgressBar: true,
      showConfirmButton: false,
      title: "Copied password!",
      text: `Successfully copied the password to your clipboard`,
      timer: 1500,
      toast: true,
      position: "top-end"
    })
  } catch (e) {
    await this.$swal({
      icon: "error",
      title: "Could not copy password",
      text: e.message
    })
  }
}

module.exports = {
  deleteEntity,
  deletePolicyItem,
  resetUserPassword,
  copyToken,
  copyPassword
}
