<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Create User</p>
    <form>
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
          :error="errors.first_name" />
        <form-input
          label="Last name"
          placeholder="Last name"
          v-model="last_name"
          :error="errors.last_name" />
      </div>

      <button @click="modify()">Make error</button>
      {{ errors }}
    </form>
    <div></div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
  methods: {
    modify() {
      this.errors = { ...this.errors, username: "hi" }
    },
  },
  data() {
    return {
      username: "",
      password: "",
      first_name: "",
      last_name: "",
      errors: {},
    }
  },
}
</script>
