<template>
  <div>
    <div class="flex items-end mb-10">
      <p class="text-5xl font-bold leading-[3rem]">Users</p>
      <div class="ml-auto">
        <t-button>Create new</t-button>
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"
      ></searchbar>
      <users-table :rows="rows" :filter="searchFilter" />
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  async fetch() {
    this.rows = (await this.$axios.$get("/users")).data;
  },
  data() {
    return {
      searchFilter: "",
      rows: [],
    };
  },
};
</script>
