<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Edit Policy</p>
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <section-header
          title="Policy information"
          subtitle="To identify the policy" />
        <form-input
          label="Name"
          placeholder="Name"
          v-model="name"
          required
          :error="errors.name" />

        <form-input
          label="Description"
          placeholder="Description"
          v-model="description"
          component="large"
          :error="errors.description" />
      </div>

      <t-alert
        :show="!!errors.message"
        variant="danger"
        :dismissible="false"
        class="mt-8"
        >{{ errors.message }}</t-alert
      >
      <t-button class="mt-4">Edit</t-button>
    </form>
  </div>
</template>

<script>
import { formMixin } from "~/mixins/formUtils"

export default {
  middleware: "authed",
  layout: "dashboard",
  mixins: [formMixin()],
  methods: {
    async submit() {
      if (this.isFormLoading()) return
      this.setFormLoading(true)
      try {
        const response = await this.$axios.$patch(
          `/policies/${this.$route.params.id}`,
          {
            name: this.name,
            description: this.description,
          }
        )
        if (response.status === "success") {
          this.$router.push(`/policies/${this.$route.params.id}`)
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
  async fetch() {
    const id = this.$route.params.id
    try {
      const policyData = (await this.$axios.$get("/policies/" + id)).data
      this.name = policyData.name
      this.description = policyData.description
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "Policy could not be found"
            : e.response.statusText,
      })
    }
  },
  data() {
    return {
      name: "",
      description: "",
      errors: {},
    }
  },
}
</script>
