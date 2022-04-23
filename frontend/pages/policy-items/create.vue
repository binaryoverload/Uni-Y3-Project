<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Create Policy Items</p>
    <form @submit.prevent="submit">
      <form-input
        label="Item Type"
        :options="[
          {
            key: 'command',
            title: 'Command',
            description: 'Executes a command on the client',
          },
          {
            key: 'package',
            title: 'Package',
            description: 'Installs or removes a package from the client',
          },
          {
            key: 'file',
            title: 'File',
            description: 'Transfers a file to the client',
          },
        ]"
        component="fancyRadio"
        v-model="type"
        required />
      <component v-if="type" :is="`${type}-type-form`" v-model="data" />
    </form>
  </div>
</template>

<script>
// Keep a cache of form data so switching types doesn't lose data
const dataCache = {}

export default {
  layout: "dashboard",
  middleware: "authed",
  data() {
    return {
      type: "command",
      data: {},
      errors: {},
    }
  },
  watch: {
    type(newType, oldType) {
      dataCache[newType] = this.data
      this.data = dataCache[oldType] || {}
    },
  },
}
</script>
