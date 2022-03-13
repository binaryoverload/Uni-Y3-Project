<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link>Back to enrolment tokens</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View Enrolment Token</p>
        <div class="flex ml-auto space-x-2">
          <refresh-button @click="$fetch()" />
          <t-button
            :to="`/users/edit/${$route.params.id}`"
            :href="`/users/edit/${$route.params.id}`"
            tagName="a"
            >Edit Token</t-button
          >
        </div>
      </div>
    </div>
    {{ tokenData }}
    <div class="space-y-8">
      <div>
        <div>
          <p class="font-bold">Details</p>
          <p class="text-slate-600">
            These are details about the enrolment token.
          </p>
          <hr class="my-2" />
        </div>

        <div>
          <table>
            <tbody>
              <tr>
                <td class="pb-2 pr-20 font-bold">Name</td>
                <td class="pb-2 text-slate-600">{{ tokenData.name }}</td>
              </tr>

              <tr>
                <td class="pb-2 font-bold">Token</td>
                <td class="pb-2 text-slate-600">
                  <div class="flex items-center space-x-2">
                    <div>
                      <font-awesome-icon
                        v-for="i in 5"
                        :key="i"
                        icon="asterisk"
                        class="h-4 text-xs text-slate-600" />
                    </div>
                    <t-button variant="neutral" @click="copyToken">
                      <font-awesome-icon icon="key" class="mr-1" />
                      Copy Token
                    </t-button>
                  </div>
                </td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Created at</td>
                <td class="pb-2 text-slate-600">
                  {{ new Date(tokenData.created_at).toLocaleString() }}
                </td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Expires at</td>
                <td class="pb-2 text-slate-600">
                  {{
                    tokenData.expires_at
                      ? new Date(tokenData.expires_at).toLocaleString()
                      : "&lt;unset&gt;"
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div></div>
    </div>
  </div>
</template>

<script>
export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
    return {
      tokenData: {},
    }
  },
  methods: {
    copyToken() {
      navigator.clipboard.writeText(this.tokenData.token).then(
        function () {
          alert("Copied enrolment token to clipboard!")
        },
        function (err) {
          console.error("Could not copy enrolment token: ", err)
        }
      )
    },
  },
  async fetch() {
    const id = this.$route.params.id
    this.tokenData = (await this.$axios.$get("/enrolment-tokens/" + id)).data
  },
}
</script>
