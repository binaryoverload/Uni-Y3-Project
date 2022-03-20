<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link to="/users">Back to users</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View User</p>
        <div class="ml-auto">
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
                  <t-button variant="neutral">
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
export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
    return {
      userData: {},
    }
  },
  async fetch() {
    const id = this.$route.params.id
    this.userData = (await this.$axios.$get("/users/" + id)).data
  },
}
</script>
