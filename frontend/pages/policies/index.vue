<template>
  <div>
    <div class="flex items-end mb-10">
      <p class="text-5xl font-bold leading-[3rem]">Policies</p>
      <div class="flex ml-auto space-x-2">
        <refresh-button @click="$fetch()" />
        <t-button to="/policies/create" href="/policies/create" tagName="a"
          >Create new</t-button
        >
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"></searchbar>
      <policies-table
        v-if="rows.length > 0"
        :rows="rows"
        :filter="searchFilter" />
      <items-not-found v-else entity="policies" link="/policies/create" />
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  async fetch() {
    this.rows = (await this.$axios.$get("/policies")).data
  },
  data() {
    return {
      rows: [],
      searchFilter: "",
    }
  },
}
</script>
