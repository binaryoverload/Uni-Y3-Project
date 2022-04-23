<template>
  <div>
    <form-input
      label="Command"
      :value="value.command"
      required
      @input="$emit('input', { ...value, command: $event })" />
    <form-input
      label="Arguments"
      :value="value.args"
      @input="$emit('input', { ...value, args: $event })" />
    <form-input
      label="Working Directory"
      :value="value.working_directory"
      @input="$emit('input', { ...value, working_directory: $event })" />
    Environment
  </div>
</template>

<script>
export default {
  props: {
    value: Object,
  },
}
</script>
