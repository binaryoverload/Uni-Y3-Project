<template>
  <div>
    <div class="flex items-end mb-10">
      <p class="text-5xl font-bold leading-[3rem]">Enrolment Tokens</p>
      <div class="flex ml-auto space-x-2">
        <refresh-button @click="$fetch()" />
        <t-button
          to="/enrolment-tokens/create"
          href="/enrolment-tokens/create"
          tagName="a"
          >Create new</t-button
        >
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"></searchbar>
      <enrolment-tokens-table
        v-if="rows.length > 0"
        :rows="rows"
        :filter="searchFilter" />
      <items-not-found
        v-else
        entity="enrolment tokens"
        link="/enrolment-tokens/create"
        class="mt-8" />
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  async fetch() {
    this.rows = (await this.$axios.$get("/enrolment-tokens")).data
  },
  data() {
    return {
      rows: [],
      searchFilter: "",
    }
  },
}
</script>
