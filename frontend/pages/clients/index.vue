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
      <searchbar placeholder="Search by name"></searchbar>
      <custom-table :rows="rows" :schema="schema" />
    </div>
  </div>
</template>

<script>
import table from "../../components/tables/table.vue";

export default {
  components: { CustomTable: table },
  layout: "dashboard",
  data() {
    return { 
        rows: [{
            name: "Hi",
            url: "https://google.com",
            status: "online",
            start: 2
        }, {
            name: "Hi1",
            url: "https://google.com",
            status: "warning",
            start: 7,
            end: 10
        }, {
            name: "Hi2",
            url: "https://google.com",
            status: "offline",
            start: 11,
            end: 10
        }], 
        schema: [{
            display: "link",
            url: (row) => row.url,
            key: "name",
            heading: "Name"
        },
        {
            display: "text",
            key: "url",
            heading: "URL"
        },
        {
            display: "progress",
            label: "uses",
            startKey: "start",
            endKey: "end",
            heading: "Usage"
        },
        {
            display: "statusIcon",
            key: (row) => row.status,
            heading: "Status"
        }] 
    };
  },
};
</script>
