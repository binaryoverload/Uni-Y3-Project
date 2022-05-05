<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link to="/users">Back to users</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View User</p>
        <div class="flex ml-auto space-x-2">
          <t-button
            @click="deleteUser"
            variant="error"
            class="space-x-2"
            v-if="$route.params.id !== $auth.user.id">
            <font-awesome-icon icon="trash" />
            <span>Delete User</span>
          </t-button>
          <t-button
            :to="`/users/edit/${$route.params.id}`"
            :href="`/users/edit/${$route.params.id}`"
            tagName="a"
            >Edit User</t-button
          >
        </div>
      </div>
    </div>
    <div class="space-y-8">
      <div>
        <div>
          <p class="font-bold">Login Information</p>
          <p class="text-slate-600">
            These is details used to login to Themis.
          </p>
          <hr class="my-2" />
        </div>
        <div>
          <table class>
            <tbody>
              <tr>
                <td class="py-2 pr-4 font-bold">Username</td>
                <td class="text-slate-600">
                  {{ userData.username }}
                </td>
              </tr>
              <tr>
                <td class="font-bold">Password</td>
                <td class="flex items-center space-x-4">
                  <div>
                    <font-awesome-icon
                      v-for="i in 5"
                      :key="i"
                      icon="asterisk"
                      class="h-4 text-xs text-slate-600" />
                  </div>
                  <t-button variant="neutral" @click="regenPassword">
                    <font-awesome-icon icon="sync" class="mr-1" />
                    Regenerate
                  </t-button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div>
          <p class="font-bold">Personal Information</p>
          <p class="text-slate-600">These are details about the user.</p>
          <hr class="my-2" />
        </div>
        <div>
          <table class>
            <tbody>
              <tr>
                <td class="py-2 pr-4 font-bold">First Name</td>
                <td class="text-slate-600">
                  {{ userData.first_name || "&lt;unset&gt;" }}
                </td>
              </tr>
              <tr>
                <td class="font-bold">Last Name</td>
                <td class="flex items-center space-x-4 text-slate-600">
                  {{ userData.last_name || "&lt;unset&gt;" }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { resetUserPassword, deleteEntity } from "~/utils/actions"

export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
    return {
      userData: {},
    }
  },
  methods: {
    async regenPassword() {
      resetUserPassword.call(this, this.userData)
    },
    async deleteUser() {
      const result = await this.$swal({
        icon: "warning",
        title: "Are you sure?",
        html: `Are you sure you want to delete the user <span class="text-indigo-700">${this.userData.username}</span>? This action is irreversible.`,
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
        `/users/${this.userData.id}`,
        function () {
          this.$swal({
            icon: "success",
            title: "Deleted user!",
            html: `Successfully delete the user <span class="text-indigo-700">${this.userData.username}</span>.`,
          })
          this.$router.push(`/users`)
        }.bind(this)
      )
    },
  },
  async fetch() {
    const id = this.$route.params.id
    try {
      this.userData = (await this.$axios.$get("/users/" + id)).data
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "User could not be found"
            : e.response.statusText,
      })
    }
  },
}
</script>
