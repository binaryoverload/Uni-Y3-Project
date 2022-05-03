<template>
  <div>
    <label :for="id" class="block mb-2 text-sm font-bold">
      <span>{{ label }}</span>
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="flex space-x-2">
      <input-box
        :value="value"
        :id="id"
        :required="required"
        @input="$emit('input', $event)"
        placeholder="Press 'Generate'"
        autocomplete="new-password"
        name="password"
        class="flex-1"
        input-classes="font-mono" />
      <t-button
        type="button"
        variant="neutral"
        @click="generatePassword()"
        class="space-x-2">
        <font-awesome-icon icon="sync" /><span>Generate</span>
      </t-button>
      <t-button
        type="button"
        variant="neutral"
        @click="copyPassword()"
        class="space-x-2">
        <font-awesome-icon icon="copy" /><span>Copy</span>
      </t-button>
    </div>
  </div>
</template>

<script>
const uniqueId = require("lodash.uniqueid")
import { copyPassword } from "~/utils/actions"

export default {
  props: {
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    required: Boolean,
  },
  methods: {
    async generatePassword() {
      const result = await fetch("https://www.dinopass.com/password/simple", {
        method: "get",
      })
      if (result.ok) {
        const text = await result.text()
        this.$emit("input", text)
      }
    },
    copyPassword() {
      copyPassword.call(this, this.value)
    },
  },
  data() {
    return {
      id: uniqueId("password-"),
    }
  },
}
</script>
