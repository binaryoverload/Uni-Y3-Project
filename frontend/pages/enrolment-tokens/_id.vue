<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link to="/enrolment-tokens">Back to enrolment tokens</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View Enrolment Token</p>
        <div class="flex ml-auto space-x-2">
          <refresh-button @click="$nuxt.refresh()" />
          <t-button @click="deleteTokens" variant="error" class="space-x-2">
            <font-awesome-icon icon="trash" />
            <span>Delete Token</span>
          </t-button>
          <t-button
            :to="`/enrolment-tokens/edit/${$route.params.id}`"
            :href="`/enrolment-tokens/edit/${$route.params.id}`"
            tagName="a"
            >Edit Token</t-button
          >
        </div>
      </div>
    </div>
    <div class="space-y-8">
      <div>
        <section-header
          title="Details"
          subtitle="These are details about the enrolment token." />

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
                {{ new Date(tokenData.created_at).toLocaleString("en-GB") }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div>
        <section-header
          title="Limit Info"
          subtitle="Information about the security limits on tokens." />
        <table>
          <tbody>
            <tr>
              <td class="pb-2 pr-20 font-bold">Expires at</td>
              <td class="pb-2 text-slate-600">
                <unset
                  :condition="tokenData.expires_at"
                  :data="
                    new Date(tokenData.expires_at).toLocaleString(`en-GB`)
                  " />
              </td>
            </tr>
            <tr>
              <td class="pb-2 font-bold">Usage limit</td>
              <td class="pb-2 text-slate-600">
                <unset
                  :condition="tokenData.usage_limit"
                  :data="tokenData.usage_limit" />
              </td>
            </tr>
            <tr>
              <td class="pb-2 font-bold">Current usage</td>
              <td class="pb-2 text-slate-600">
                {{ tokenData.usage_current }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { copyToken, deleteEntity } from "~/utils/actions"
import unset from "../../components/utils/unset.vue"

export default {
  components: { unset },
  middleware: "authed",
  layout: "dashboard",
  data() {
    return {
      tokenData: {},
    }
  },
  methods: {
    async copyToken() {
      copyToken.call(this, this.tokenData.token)
    },
    async deleteTokens() {
      const result = await this.$swal({
        icon: "warning",
        title: "Are you sure?",
        html: `Are you sure you want to delete the enrolment token <span class="text-indigo-700">${this.tokenData.name}</span>? This action is irreversible.`,
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
        `/enrolment-tokens/${this.tokenData.id}`,
        function () {
          this.$swal({
            icon: "success",
            title: "Deleted token!",
            html: `Successfully delete the token <span class="text-indigo-700">${this.tokenData.name}</span>.`,
          })
          this.$router.push(`/enrolment-tokens`)
        }.bind(this)
      )
    },
  },
  async fetch() {
    const id = this.$route.params.id
    try {
      this.tokenData = (await this.$axios.$get("/enrolment-tokens/" + id)).data
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "Enrolment token could not be found"
            : e.response.statusText,
      })
    }
  },
}
</script>
