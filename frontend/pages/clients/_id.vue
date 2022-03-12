<template>
  <div>
    <div class="mb-10 -mt-8">
      <back-link>Back to clients</back-link>
      <div class="flex items-end">
        <p class="text-5xl font-bold leading-[3rem]">View Client</p>
        <div class="flex ml-auto space-x-2">
          <refresh-button @click="$fetch()" />
          <t-button
            :to="`/clients/edit/${$route.params.id}`"
            :href="`/clients/edit/${$route.params.id}`"
            tagName="a"
            >Edit Client</t-button
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
                <td class="pb-2 pr-10 font-bold">Name</td>
                <td class="text-slate-600">{{ clientData.name }}</td>
              </tr>
              <tr>
                <td class="pb-2 pr-10 font-bold">Last Activity</td>
                <td class="text-slate-600">
                  {{ new Date(clientData.last_activity) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div>
        <div>
          <p class="font-bold">Network details</p>
          <p class="text-slate-600">Last known network details.</p>
          <hr class="my-2" />
        </div>
        <div>
          <table class>
            <tbody>
              <tr>
                <td class="pb-2 pr-10 font-bold">MAC Address</td>
                <td class="text-slate-600">{{ clientData.mac_address }}</td>
              </tr>
              <tr>
                <td class="pb-2 pr-10 font-bold">IP Address</td>
                <td class="text-slate-600">{{ clientData.last_known_ip }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div v-if="clientData.os_information">
        <div>
          <p class="font-bold">OS Information</p>
          <p class="text-slate-600">Details about the OS info.</p>
          <hr class="my-2" />
        </div>
        <div>
          <table class>
            <tbody>
              <tr
                v-for="entry in Object.entries(clientData.os_information)"
                :key="entry[0]">
                <td class="pb-2 pr-10 font-bold">{{ entry[0] }}</td>
                <td class="pb-2 text-slate-600">{{ entry[1] }}</td>
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
      clientData: {},
    }
  },
  async fetch() {
    const id = this.$route.params.id
    this.clientData = (await this.$axios.$get("/clients/" + id)).data
  },
}
</script>
