<template>
  <div class="space-y-4">
    <form-input
      component="select"
      :options="options"
      label="File"
      required
      :value="value.file_id"
      @input="$emit('input', { ...value, file_id: $event })" />
    <form-input
      label="Destination"
      required
      :value="value.destination"
      @input="$emit('input', { ...value, destination: $event })" />
  </div>
</template>

<script>
export default {
  props: {
    value: Object,
    errors: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      options: [],
      val: null,
    }
  },
  async fetch() {
    this.options = (await this.$axios.$get("/files")).data.map(opt => {
      return {
        id: opt.id,
        name: opt.name + " (" + new Date(opt.created_at).toLocaleString() + ")",
      }
    })
  },
}
</script>
