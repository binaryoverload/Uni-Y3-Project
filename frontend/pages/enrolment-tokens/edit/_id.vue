<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Edit Token</p>
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
      <t-button class="mt-4"> Edit </t-button>
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
          `/enrolment-tokens/${this.$route.params.id}`,
          {
            name: this.name,
            expires_at:
              !this.expires_at || this.expires_at.length === 0
                ? null
                : this.expires_at,
            usage_limit: parseInt(this.usage_limit) || null,
          }
        )
        if (response.status === "success") {
          this.$router.push(`/enrolment-tokens/${this.$route.params.id}`)
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
      const tokenData = (await this.$axios.$get("/enrolment-tokens/" + id)).data
      this.name = tokenData.name
      this.expires_at = tokenData.expires_at
      this.usage_limit = tokenData.usage_limit.toString()
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "Enrolment token could not be found"
            : e.response.statusText,
      })
    }
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
