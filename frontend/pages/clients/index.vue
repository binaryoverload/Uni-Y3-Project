<template>
  <div>
    <div class="mb-10">
      <p class="text-5xl font-bold leading-[3rem] mb-4">Clients</p>
      <div class="space-y-1">
        <p class="text-slate-600">
          Clients are added through enrolment tokens.
        </p>
        <nuxt-link
          to="/enrolment-tokens"
          class="flex items-center text-indigo-600 hover:text-indigo-700 hover:underline"
          ><font-awesome-icon icon="arrow-right" class="mr-2" />Create new
          enrolment token</nuxt-link
        >
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"
      ></searchbar>
      <clients-table :rows="rows" :filter="searchFilter" />
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  data() {
    return {
      rows: [
        {
          name: "JVS's PC",
          last_activity: new Date(),
          mac_address: "54:af:78:22:54:38",
          last_known_ip: "10.28.160.0",
          os_information: {
            name: "Windows 10",
          },
        },
      ],
      searchFilter: "",
    };
  },
};
</script>
