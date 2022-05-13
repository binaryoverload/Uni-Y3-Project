<template>
  <div>
    <div class="flex items-end mb-10">
      <p class="text-5xl font-bold leading-[3rem]">Files</p>
      <div class="flex ml-auto space-x-2">
        <refresh-button @click="$nuxt.refresh()" />
        <t-button to="/files/create" href="/files/create" tagName="a"
          >Upload new</t-button
        >
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"></searchbar>
      <files-table v-if="rows.length > 0" :rows="rows" :filter="searchFilter" />
      <items-not-found v-else entity="files" link="/files/create" />
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  async fetch() {
    this.rows = (await this.$axios.$get("/files")).data
  },
  data() {
    return {
      searchFilter: "",
      rows: [],
    }
  },
}
</script>
