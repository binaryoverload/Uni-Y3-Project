<template>
    <p>{{ policiesData }}</p>
</template>

<script>
export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
      return {
          policiesData: {}
      }
  },
  async fetch() {
      const id = this.$route.params.id
      this.policiesData = (await this.$axios.$get("/policies/" + id)).data
  }
}
</script>