<template>
  <div>
    <form-input
      component="select"
      :options="[{ id: 'test', name: 'hi' }]"
      label="File"
      :value="value.file_id"
      @input="$emit('input', { ...value, file_id: $event })" />
    {{ val }}
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
      val: null,
    }
  },
}
</script>
