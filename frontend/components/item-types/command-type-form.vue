<template>
  <div class="space-y-4">
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
    <div class="space-y-2">
      <p class="text-sm font-bold">Environment Variables</p>
      <div>
        <p
          v-for="envKey in Object.keys(value.env || {})"
          :key="envKey"
          class="flex items-center">
          <span class="font-mono">{{ envKey }}</span> =
          <span class="font-mono">{{ value.env[envKey] }}</span>
          <font-awesome-icon
            icon="times"
            class="ml-2 text-red-600 cursor-pointer"
            @click="removeEnv(envKey)" />
        </p>
      </div>
      <form @submit.prevent="addEnv" class="flex gap-1">
        <input-box
          placeholder="Variable Name"
          ref="envName"
          required
          v-model="envName" />
        <input-box
          placeholder="Variable Value"
          ref="envValue"
          required
          v-model="envValue" />
        <t-button class="ml-1">Add</t-button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Object,
  },
  data() {
    return {
      envName: "",
      envValue: "",
    }
  },
  methods: {
    addEnv() {
      if (!this.envName | !this.envValue) {
        return
      }
      const env = { ...this.value.env, [this.envName]: this.envValue }
      this.envName = ""
      this.envValue = ""
      this.$emit("input", { ...this.value, env })
    },
    removeEnv(envName) {
      const env = { ...this.value.env }
      delete env[envName]
      this.$emit("input", { ...this.value, env })
    },
  },
}
</script>
