<template>
  <div class="flex items-center justify-center w-full h-full">
    <div class="flex flex-col items-center space-y-4">
      <font-awesome-icon icon="times-circle" class="text-6xl text-red-500" />
      <div class="space-y-2 text-center text-slate-900">
        <p class="text-3xl font-bold">
          {{ title }}
        </p>
        <p v-if="error.message">{{ error.message }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ["error"],
  computed: {
    title() {
      if (this.error.statusCode === 404) {
        return "404 Not Found!"
      } else {
        return `${this.error.statusCode}: Something went wrong!`
      }
    },
  },
  layout: function ({ $auth }) {
    if ($auth.loggedIn) {
      return "dashboard"
    } else {
      return "error"
    }
  },
}
</script>
