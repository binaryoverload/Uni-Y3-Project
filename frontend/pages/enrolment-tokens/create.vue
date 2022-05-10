<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">
      Create Enrolment Token
    </p>
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <section-header
          title="General info"
          subtitle="Generic information about the token." />
        <form-input
          label="Name"
          placeholder="Name"
          v-model="name"
          required
          :error="errors.name" />
      </div>
      <div class="mt-16 space-y-4">
        <section-header
          title="Token Limits"
          subtitle="Limitations on the token for security purposes." />
        <form-input
          label="Expires at"
          placeholder="Expires at"
          v-model="expires_at"
          type="datetime-local"
          :error="errors.expires_at" />
        <form-input
          label="Usage limit"
          placeholder="Usage limit"
          v-model="usage_limit"
          :error="errors.usage_limit" />
      </div>

      <t-alert
        :show="!!errors.message"
        variant="danger"
        :dismissible="false"
        class="mt-8"
        >{{ errors.message }}</t-alert
      >
      <t-button class="mt-4"> Create </t-button>
    </form>
    <div></div>
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
        const response = await this.$axios.$post("/enrolment-tokens", {
          name: this.name,
          expires_at: this.expires_at,
          usage_limit: this.usage_limit,
        })
        if (response.status === "success") {
          this.$router.push(`/enrolment-tokens/${response.data.id}`)
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
      expires_at: null,
      usage_limit: null,
      errors: {},
    }
  },
}
</script>
