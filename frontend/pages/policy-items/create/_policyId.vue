<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Create Policy Item</p>
    <form @submit.prevent="submit" class="space-y-4">
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
      <component
        v-if="type"
        :is="`${type}-type-form`"
        v-model="data"
        :errors="dataErrors" />
      <t-button class="mt-4">Create</t-button>
    </form>
  </div>
</template>

<script>
import { formMixin } from "~/mixins/formUtils"

export default {
  layout: "dashboard",
  middleware: "authed",
  mixins: [formMixin()],
  data() {
    return {
      type: "command",
      dataCache: {
        command: {
          args: "",
        },
        package: {
          action: "install",
          packages: [],
        },
        file: {},
      },
      errorCache: {},
      data: {},
      errors: {},
    }
  },
  mounted() {
    this.data = this.dataCache["command"]
  },
  computed: {
    dataErrors() {
      const dataErrors = {}
      if (this.errors) {
        for (let [key, value] of Object.entries(this.errors)) {
          if (key.startsWith("data.")) {
            dataErrors[key.substring(5)] = value
          }
        }
      }
      return dataErrors
    },
  },
  methods: {
    async submit() {
      if (this.isFormLoading()) return
      this.setFormLoading(true)
      try {
        const modifiedData =
          this.data.args != null
            ? {
                ...this.data,
                args: this.data.args === "" ? [] : this.data.args.split(" "),
              }
            : this.data

        const policyId = this.$route.params.policyId
        const response = await this.$axios.$post("/policy-items", {
          type: this.type,
          data: modifiedData,
          policy_id: policyId,
        })
        if (response.status === "success") {
          this.$router.push(`/policies/${policyId}`)
          return
        }
        this.setFormLoading(false)
      } catch (error) {
        this.setFormLoading(false)
        if (error.response) {
          this.errors = error.response.data.data
        } else if (error.request) {
          this.errors = {
            message: "Could not contact the server",
          }
        } else {
          this.errors = {
            message: error.message,
          }
        }
      }
    },
  },
  watch: {
    type(newType, oldType) {
      this.dataCache[oldType] = this.data
      this.data = this.dataCache[newType] || {}

      this.errorCache[oldType] = this.errors
      this.errors = this.errorCache[newType] || {}
    },
  },
}
</script>
