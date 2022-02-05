<template>
  <div>
    <div class="flex items-end mb-10">
      <p class="text-5xl font-bold leading-[3rem]">Policies</p>
      <div class="ml-auto">
        <t-button>Create new</t-button>
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"
      ></searchbar>
      <policies-table :rows="rows" :filter="searchFilter"/> 
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
          name: "Hi",
          url: "https://google.com",
          status: "online",
          start: 2,
        },
        {
          name: "Hi1",
          url: "https://google.com",
          status: "warning",
          start: 7,
          end: 10,
        },
        {
          name: "Hi2",
          url: "https://google.com",
          status: "offline",
          start: 11,
          end: 10,
        },
        {
          name: "Hi2",
          url: "https://google.com",
          status: "unknown",
          start: 11,
          end: 10,
        },
      ],
      schema: [
        {
          display: "link",
          url: (row) => row.url,
          key: "name",
          heading: "Name",
        },
        {
          display: "text",
          key: "url",
          heading: "URL",
        },
        {
          display: "progress",
          label: "uses",
          startKey: "start",
          endKey: "end",
          heading: "Usage",
        },
        {
          display: "statusIcon",
          key: (row) => row.status,
          heading: "Status",
        },
      ],
      searchFilter: "",
    };
  },
};
</script>
