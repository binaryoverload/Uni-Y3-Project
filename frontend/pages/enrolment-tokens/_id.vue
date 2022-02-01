<template>
    <p>{{ tokenData }}</p>
</template>

<script>
export default {
    middleware: "authed",
  layout: "dashboard",
  data() {
      return {
          tokenData: {}
      }
  },
  async fetch() {
      const id = this.$route.params.id
      this.tokenData = (await this.$axios.$get("/enrolment-tokens/" + id)).data
  }
}
</script>