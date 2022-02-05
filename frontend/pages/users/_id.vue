<template>
    <p>{{ userData }}</p>
</template>

<script>
export default {
  middleware: "authed",
  layout: "dashboard",
  data() {
      return {
          userData: {}
      }
  },
  async fetch() {
      const id = this.$route.params.id
      this.userData = (await this.$axios.$get("/users/" + id)).data
  }
}
</script>