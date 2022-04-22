<template>
  <div>
    <label
      :for="id"
      class="block mb-2 text-sm font-bold"
      :class="error ? 'text-red-500' : ''">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <component
      :is="(component && components[component]) || 'input-box'"
      :value="value"
      @input="$emit('input', $event)"
      :id="id"
      :placeholder="placeholder"
      :required="required"
      :class="inputClasses"
      v-bind="$attrs" />
    <p v-if="error" class="mt-1 space-x-2 text-sm font-bold text-red-500">
      <font-awesome-icon icon="exclamation-triangle" /><span>{{ error }}</span>
    </p>
  </div>
</template>

<script>
const uniqueId = require("lodash.uniqueid")

const components = {
  large: "large-input-box",
  fancyRadio: "fancy-radio",
}

export default {
  inheritAttrs: false,
  props: {
    value: {
      type: String,
    },
    placeholder: {
      type: String,
    },
    label: {
      type: String,
      required: true,
    },
    error: {
      type: String,
    },
    required: Boolean,
    component: String,
  },
  methods: {},
  data() {
    return {
      id: uniqueId("form-"),
      components,
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
