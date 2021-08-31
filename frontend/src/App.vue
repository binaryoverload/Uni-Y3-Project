<template>
  <div id="app">
    <Alert />
    <form @submit.prevent="submitLogin">
      <label for="username">Username:</label>
      <input type="text" id="username" name="username" v-model="username" />

      <br />

      <label for="password">Password:</label>
      <input type="password" id="password" name="password" v-model="password" />

      <input type="submit" value="Submit" />

      <p>Status: {{ status }}</p>
      <p>Token: {{ token }}</p>
    </form>
  </div>
</template>

<script>

import Alert from './components/Alert.vue'

export default {
  name: "App",
  components: {
    Alert
  },
  data() {
    return {
      username: "",
      password: ""
    };
  },
  computed: {
    token() {
      return this.$store.state.auth.user
    },
    status() {
      return this.$store.state.auth.status
    }
  },
  methods: {
    submitLogin() {
      const { username, password } = this
      this.$store.dispatch('auth/login', { username, password })  
    },
  },
};
</script>

<style></style>
