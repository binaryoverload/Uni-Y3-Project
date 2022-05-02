<template>
  <select :id="id" @change="$emit('input', $event.target.value)">
    <option value="" :selected="!value">
      {{ placeholder || "Select an option..." }}
    </option>
    <option
      v-for="option in options"
      :value="option.id"
      :key="option.id"
      :selected="option.id === value">
      {{ option.name }}
    </option>
  </select>
</template>

<script>
export default {
  props: {
    id: String,
    value: String,
    options: Array,
    placeholder: String,
  },
}
</script>
