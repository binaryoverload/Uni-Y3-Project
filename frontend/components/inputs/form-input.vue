<template>
  <div>
    <label
      :for="id"
      class="block mb-2 text-sm font-bold"
      :class="error ? 'text-red-500' : ''">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <input-box
      :value="value"
      :id="id"
      :placeholder="placeholder"
      :required="required"
      :class="inputClasses" />
    <p v-if="error" class="mt-1 space-x-2 text-sm font-bold text-red-500">
      <font-awesome-icon icon="exclamation-triangle" /><span>{{ error }}</span>
    </p>
  </div>
</template>

<script>
const uniqueId = require("lodash.uniqueid")
export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    placeholder: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    error: {
      type: String,
    },
    required: Boolean,
  },
  methods: {},
  data() {
    return {
      id: uniqueId("form-"),
    }
  },
  computed: {
    inputClasses() {
      if (this.error) {
        return "border-red-500 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-opacity-50 focus-within:ring-red-400"
      }
      return undefined
    },
  },
}
</script>
