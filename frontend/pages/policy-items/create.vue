<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Create Policy Items</p>
    <form @submit.prevent="submit">
      <form-input
        label="Item Type"
        :options="[
          {
            key: 'file',
            title: 'File',
            description: 'Transfers a file to the client',
          },
          {
            key: 'package',
            title: 'Package',
            description: 'Installs or removes a package from the client',
          },

          {
            key: 'command',
            title: 'Command',
            description: 'Executes a command on the client',
          },
        ]"
        component="fancyRadio"
        v-model="type"
        required />
    </form>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  data() {
    return {
      type: "",
      data: {},
      errors: {},
    }
  },
}
</script>
