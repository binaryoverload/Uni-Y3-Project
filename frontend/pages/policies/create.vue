<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Create Policies</p>
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <section-header
          title="Account information"
          subtitle="For logging in and such." />
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
  methods: {
    async submit() {
      if (this.isFormLoading()) return
      this.setFormLoading(true)
      try {
        const response = await this.$axios.$post("/policies", {
          name: this.name,
          description: this.description,
          created_by: this.$auth.user.id,
        })
        if (response.status === "success") {
          this.$router.push(`/policies/${response.data.id}`)
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
  data() {
    return {
      name: "",
      description: null,
      errors: {},
    }
  },
}
</script>
