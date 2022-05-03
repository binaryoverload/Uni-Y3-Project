<template>
  <t-button variant="neutral" @click="onClick">
    <font-awesome-icon
      icon="sync"
      class="transition-transform ease-in-out"
      :class="{ 'rotate-180': spinning }"
      @transitionend="reset" />
  </t-button>
</template>

<script>
export default {
  data() {
    return {
      spinning: false,
    }
  },
  methods: {
    onClick() {
      this.spinning = true
      this.$emit("click", this.$event)
    },
    reset() {
      this.spinning = false
    },
  },
}
</script>
