<template>
  <div
    class="items-center max-w-xs border rounded bg-slate-100 border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-opacity-50 focus-within:ring-slate-400">
    <input
      :type="type"
      v-bind:value="value"
      v-on:input="$emit('input', $event.target.value)"
      class="w-full bg-transparent border-0 text-slate-600 placeholder-slate-300 focus:outline-0 focus:ring-0"
      :class="$props['input-classes']"
      :disabled="disabled"
      :id="id"
      :required="required"
      :placeholder="placeholder"
      :maxlength="maxLength"
      v-bind="$attrs" />
  </div>
</template>

<script>
export default {
  props: {
    placeholder: String,
    value: String,
    id: String,
    disabled: Boolean,
    required: Boolean,
    maxLength: String,
    "input-classes": String,
    type: {
      type: String,
      default: "text",
    },
  },
}
</script>
