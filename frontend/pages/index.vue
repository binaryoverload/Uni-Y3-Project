<template>
  <div id="app">
    <Alert />
    <form @submit.prevent="submitLogin">
      <label for="username">Username:</label>
      <input  type="text" id="username" name="username" v-model="username" />

      <br />

      <label for="password">Password:</label>
      <input type="password" id="password" name="password" v-model="password" />

      <input type="submit" value="Submit" />

      <p>Logged in: {{ $auth.loggedIn }}</p>
      <p>User: {{ $auth.user }}</p>
    </form>
  </div>
</template>

<script>

export default {
  name: "App",
  data() {
    return {
      username: "",
      password: ""
    };
  },
  methods: {
    submitLogin() {
      const { username, password } = this;
      this.$auth.loginWith('local', {
          data: {
              username,
              password
          }
      })
    },
  },
};
</script>

<style></style>
