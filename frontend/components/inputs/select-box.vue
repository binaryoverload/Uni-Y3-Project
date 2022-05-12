<template>
  <select
    :id="id"
    @change="$emit('input', $event.target.value)"
    :required="required"
    class="items-center min-w-0 border rounded bg-slate-100 border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-opacity-50 focus-within:ring-slate-400">
    <option
      v-if="placeholder == null || placeholder.length > 0"
      value=""
      :selected="!value">
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
    required: Boolean,
  },
}
</script>
