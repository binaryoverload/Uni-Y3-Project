<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Edit User</p>
    <form @submit.prevent="submit">
      <div class="space-y-4">
        <section-header
          title="Account information"
          subtitle="For logging in and such." />
        <form-input
          label="Username"
          placeholder="Username"
          v-model="username"
          required
          :error="errors.username" />
        <password-input
          label="Password"
          v-model="password"
          class="mt-4"
          required />
      </div>
      <div class="mt-16 space-y-4">
        <section-header
          title="Personal information"
          subtitle="Personal stoof" />
        <form-input
          label="First name"
          placeholder="First name"
          v-model="first_name"
          :error="errors.first_name"
          required />
        <form-input
          label="Last name"
          placeholder="Last name"
          v-model="last_name"
          :error="errors.last_name"
          required />
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
        const response = await this.$axios.$patch(
          `/users/${this.$route.params.id}`,
          {
            username: this.username,
            password: this.password,
            first_name: this.first_name,
            last_name: this.last_name,
          }
        )
        if (response.status === "success") {
          this.$router.push(`/users/${response.data.id}`)
          return
        }
        this.setFormLoading(false)
      } catch (error) {
        this.setFormLoading(false)
        if (error.response) {
          this.errors = error.response.data
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
      const userData = (await this.$axios.$get("/users/" + id)).data
      this.username = userData.username
      this.first_name = userData.first_name
      this.last_name = userData.last_name
    } catch (e) {
      this.$nuxt.context.error({
        status: e.response.status,
        message:
          e.response.status === 404
            ? "User could not be found"
            : e.response.statusText,
      })
    }
  },
  data() {
    return {
      username: "",
      password: "*****",
      first_name: null,
      last_name: null,
      errors: {},
    }
  },
}
</script>
