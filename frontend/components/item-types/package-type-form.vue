<template>
  <div class="space-y-2">
    <form-input
      label="Package Action"
      :options="[
        {
          key: 'install',
          title: 'Install',
        },
        {
          key: 'uninstall',
          title: 'Uninstall',
        },
      ]"
      component="fancyRadio"
      :error="errors.action"
      :value="value.action || 'install'"
      @input="$emit('input', { ...value, action: $event })"
      required />
    <div class="space-y-2">
      <p
        class="text-sm font-bold"
        :class="errors.packages ? 'text-red-500' : ''">
        Packages
      </p>
      <div>
        <p v-for="pack in value.packages" :key="pack" class="flex items-center">
          <span class="font-mono">{{ pack }}</span>
          <font-awesome-icon
            icon="times"
            class="ml-2 text-red-600 cursor-pointer"
            @click="removePackage(pack)" />
        </p>
      </div>
      <form @submit.prevent="addPackage" class="flex gap-1">
        <input-box placeholder="Package" required v-model="packInput" />
        <t-button class="ml-1">Add</t-button>
      </form>
      <p
        v-if="errors.packages"
        class="mt-1 space-x-2 text-sm font-bold text-red-500">
        <font-awesome-icon icon="exclamation-triangle" /><span>{{
          errors.packages
        }}</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    value: Object,
    errors: {
      type: Object,
      default: () => {
        return {}
      },
    },
  },
  data() {
    return {
      packInput: "",
    }
  },
  methods: {
    addPackage() {
      const packages = this.value.packages || []
      if (packages.indexOf(this.packInput) === -1) {
        packages.push(this.packInput)
      }
      this.$emit("input", { ...this.value, packages })
    },
    removePackage(pack) {
      const packages = this.value.packages || []
      const index = packages.indexOf(pack)
      if (index > -1) {
        packages.splice(index, 1)
      }
      this.$emit("input", { ...this.value, packages })
    },
  },
}
</script>
