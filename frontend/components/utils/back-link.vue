<template>
  <p
    @click="go"
    class="mb-2 min-h-[1.5rem] text-indigo-600 cursor-pointer -mt- hover:text-indigo-700">
    <font-awesome-icon icon="arrow-left" class="mr-2" /><slot />
  </p>
</template>

<script>
export default {
  props: {
    to: String,
  },
  methods: {
    go() {
      if (this.to) {
        this.$router.push(this.to)
      } else {
        this.$router.go(-1)
      }
    },
  },
}
</script>
