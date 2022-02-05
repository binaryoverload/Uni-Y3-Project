<template>
    <p>{{ clientData }}</p>
</template>

<script>
export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
      return {
          clientData: {}
      }
  },
  async fetch() {
      const id = this.$route.params.id
      this.clientData = (await this.$axios.$get("/clients/" + id)).data
  }
}
</script>