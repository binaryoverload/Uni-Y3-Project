<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link to="/policies">Back to policies</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View Policy</p>
        <div class="flex ml-auto space-x-2">
          <refresh-button @click="$nuxt.refresh()" />
          <t-button @click="deletePolicy" variant="error" class="space-x-2">
            <font-awesome-icon icon="trash" />
            <span>Delete Policy</span>
          </t-button>
          <t-button
            :to="`/policies/edit/${$route.params.id}`"
            :href="`/policies/edit/${$route.params.id}`"
            tagName="a"
            >Edit Policy</t-button
          >
        </div>
      </div>
    </div>
    <div class="space-y-8">
      <div>
        <div>
          <p class="font-bold">Details</p>
          <p class="text-slate-600">These are details about the policy.</p>
          <hr class="my-2" />
        </div>

        <div>
          <table class>
            <tbody>
              <tr>
                <td class="pb-2 pr-20 font-bold">Name</td>
                <td class="pb-2 text-slate-600">{{ policiesData.name }}</td>
              </tr>
              <tr v-if="policiesData.description">
                <td class="pb-2 font-bold">Description</td>
                <td class="pb-2 text-slate-600">
                  {{ policiesData.description }}
                </td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Created at</td>
                <td class="pb-2 text-slate-600">
                  {{
                    new Date(policiesData.created_at).toLocaleString("en-GB")
                  }}
                </td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Updated at</td>
                <td class="pb-2 text-slate-600">
                  {{
                    new Date(policiesData.updated_at).toLocaleString("en-GB")
                  }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <section-header
          title="Policy Item"
          subtitle="The items that this policy will execute.">
          <t-button
            :to="`/policy-items/create/${policiesData.id}`"
            :href="`/policy-items/create/${policiesData.id}`"
            tagName="a"
            >New Item</t-button
          >
        </section-header>
        <div
          v-if="
            policiesData.policy_items && policiesData.policy_items.length > 0
          "
          class="flex flex-col flex-wrap gap-2 lg:flex-row">
          <base-item-card
            v-for="item in policiesData.policy_items"
            :key="item.id"
            :item="item" />
        </div>
        <items-not-found v-else entity="policy items" />
      </div>
    </div>
  </div>
</template>

<script>
import { deleteEntity } from "~/utils/actions"

String.prototype.toTitle = function () {
  return this.replace(/(^|\s)\S/g, function (t) {
    return t.toUpperCase()
  })
}

export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
    return {
      policiesData: {},
    }
  },
  methods: {
    async deletePolicy() {
      const result = await this.$swal({
        icon: "warning",
        title: "Are you sure?",
        html: `Are you sure you want to delete the policy <span class="text-indigo-700">${this.policiesData.name}</span>? This action is irreversible.`,
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
        `/policies/${this.policiesData.id}`,
        function () {
          this.$swal({
            icon: "success",
            title: "Deleted policy!",
            html: `Successfully delete the policy <span class="text-indigo-700">${this.policiesData.name}</span>.`,
          })
          this.$router.push(`/policies`)
        }.bind(this)
      )
    },
  },
  async fetch() {
    const id = this.$route.params.id
    try {
      this.policiesData = (await this.$axios.$get("/policies/" + id)).data
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "Policy could not be found"
            : e.response.statusText,
      })
    }
    this.policiesData.policy_items.sort(
      (a, b) => a.policy_order - b.policy_order
    )
  },
}
</script>
