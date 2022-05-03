<template>
  <div>
    <div class="flex items-end mb-10">
      <div>
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
      <div class="ml-auto">
        <refresh-button @click="$nuxt.refresh()" />
      </div>
    </div>
    <div>
      <searchbar
        placeholder="Search by name"
        v-model="searchFilter"></searchbar>
      <clients-table
        v-if="rows.length > 0"
        :rows="rows"
        :filter="searchFilter" />
      <items-not-found v-else entity="clients" class="mt-8" />
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  data() {
    return {
      rows: [],
      searchFilter: "",
    }
  },
  async fetch() {
    this.rows = (await this.$axios.$get("/clients")).data
  },
}
</script>
