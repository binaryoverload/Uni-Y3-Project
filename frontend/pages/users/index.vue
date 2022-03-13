<template>
  <div>
    <div class="flex items-end mb-10">
      <p class="text-5xl font-bold leading-[3rem]">Users</p>
      <div class="flex ml-auto space-x-2">
        <refresh-button @click="$fetch()" />
        <t-button to="/users/create" href="/users/create" tagName="a"
          >Create new</t-button
        >
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"></searchbar>
      <users-table v-if="rows.length > 0" :rows="rows" :filter="searchFilter" />
      <items-not-found v-else entity="users" link="/users/create" />
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  async fetch() {
    this.rows = (await this.$axios.$get("/users")).data
  },
  data() {
    return {
      searchFilter: "",
      rows: [],
    }
  },
}
</script>
