<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link>Back to policies</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View Policy</p>
        <div class="flex ml-auto space-x-2">
          <refresh-button @click="$fetch()" />
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
                <td class="pb-2 pr-20 font-bold">Id</td>
                <td class="pb-2 text-slate-600">{{ policiesData.id }}</td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Name</td>
                <td class="pb-2 text-slate-600">{{ policiesData.name }}</td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Created at</td>
                <td class="pb-2 text-slate-600">
                  {{ new Date(policiesData.created_at).toLocaleString() }}
                </td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Updated at</td>
                <td class="pb-2 text-slate-600">
                  {{ new Date(policiesData.updated_at).toLocaleString() }}
                </td>
              </tr>
              <tr>
                <td class="pb-2 font-bold">Name</td>
                <td class="pb-2 text-slate-600">{{ policiesData.name }}</td>
              </tr>
              <tr v-if="policiesData.description">
                <td class="pb-2 font-bold">Description</td>
                <td class="pb-2 text-slate-600">
                  {{ policiesData.description }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div>
          <p class="font-bold">Policy Items</p>
          <p class="text-slate-600">The items that this policy will execute.</p>
          <hr class="my-2" />
        </div>
        <div class="flex flex-col gap-2 lg:flex-row">
          <base-item-card
            v-for="item in policiesData.policy_items"
            :key="item.id"
            :item="item" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
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
  async fetch() {
    const id = this.$route.params.id
    this.policiesData = (await this.$axios.$get("/policies/" + id)).data
    this.policiesData.policy_items.sort(
      (a, b) => a.policy_order - b.policy_order
    )
  },
}
</script>
