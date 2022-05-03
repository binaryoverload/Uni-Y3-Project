<template>
  <div>
    {{ error.statusCode }}
  </div>
</template>

<script>
export default {
  props: ["error"],
  layout: function ({ $auth }) {
    if ($auth.loggedIn) {
      return "dashboard"
    } else {
      return "error"
    }
  },
}
</script>
