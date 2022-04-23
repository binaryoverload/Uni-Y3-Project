<template>
  <div class="flex gap-2">
    <label
      v-for="option in options"
      :key="option.key"
      class="flex items-center flex-1 max-w-sm py-4 pl-3 pr-6 transition-colors border-2 rounded cursor-pointer"
      :class="{
        'border-slate-300': value !== option.key,
        'border-indigo-600': value === option.key,
      }">
      <div class="flex items-center pl-4 pr-6">
        <input
          type="radio"
          :name="name"
          :key="option.key"
          class="transition-colors cursor-pointer text-slate-300 checked:text-indigo-600 focus:ring-indigo-600 focus:ring-2 focus:outline-none focus:ring-opacity-50 focus:ring-offset-0"
          :checked="value === option.key"
          :required="required"
          @input="$emit('input', option.key)" />
      </div>
      <div class="space-y-0.5">
        <p class="text-xl">{{ option.title }}</p>
        <p class="text-slate-600">{{ option.description }}</p>
      </div>
    </label>
  </div>
</template>

<script>
const uniqueId = require("lodash.uniqueid")
export default {
  props: {
    options: {
      type: Array,
      required: true,
    },
    value: {
      type: String,
    },
    required: Boolean,
  },
  data() {
    return {
      name: uniqueId("radio-"),
    }
  },
}
</script>
