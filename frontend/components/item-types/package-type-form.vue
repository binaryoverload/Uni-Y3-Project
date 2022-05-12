<template>
  <div class="space-y-4">
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
        :class="firstPackageError ? 'text-red-500' : ''">
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
        <input-box
          placeholder="Package"
          required
          v-model="packInput"
          max-length="50" />
        <t-button class="ml-1">Add</t-button>
      </form>
      <p
        v-if="firstPackageError"
        class="mt-1 space-x-2 text-sm font-bold text-red-500">
        <font-awesome-icon icon="exclamation-triangle" /><span>{{
          firstPackageError
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
  computed: {
    firstPackageError() {
      if (this.errors) {
        const packagesError = Object.keys(this.errors).find(s =>
          s.startsWith("packages")
        )
        if (!this.errors.packages && packagesError) {
          return this.errors[packagesError]
        }
      }
      return null
    },
  },
  methods: {
    addPackage() {
      const packages = this.value.packages || []

      const inputPackages = this.packInput
        .trim()
        .split(/[ ;,|]/)
        .filter(s => s.length > 0)

      for (let pack of inputPackages) {
        if (packages.indexOf(pack) === -1) {
          packages.push(pack)
        }
      }

      this.$emit("input", { ...this.value, packages })
      this.packInput = ""
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
