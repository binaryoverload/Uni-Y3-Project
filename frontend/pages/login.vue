<template>
  <div id="app" class="flex items-center justify-center h-full bg-slate-800">
    <div class="flex flex-col items-center py-10 space-y-4 text-white rounded px-14 bg-slate-900">
      <p class="self-start text-4xl font-medium">
        Themis
      </p>
      <t-alert
        :show="!!$store.state.alert.message"
        :variant="$store.state.alert.type"
        :dismissible="false"
        class="w-full"
        >{{ $store.state.alert.message }}
      </t-alert>
      <form @submit.prevent="submitLogin" class="">
        <div>
          <label for="username" class="block text-sm">Username</label>
          <input type="text" id="username" name="username" v-model="username" placeholder="Username" class="w-full border rounded border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-opacity-50 focus:ring-slate-400 placeholder-slate-300 text-slate-900" />
        </div>

        <div>
          <label for="password" class="block mt-4 text-sm">Password</label>
          <input type="password" id="password" name="password" v-model="password" placeholder="Password" class="w-full border rounded border-slate-300 focus:border-slate-400 focus:ring-2 focus:ring-opacity-50 focus:ring-slate-400 placeholder-slate-300 text-slate-900" />
        </div>

        <t-button class="mx-auto mt-10">Login</t-button>
      </form>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
    };
  },
  middleware: ["guest"],
  methods: {
    async submitLogin() {
      const { username, password } = this;
      try {
        await this.$auth.loginWith("local", {
          data: {
            username,
            password,
          },
        });
        this.$store.commit("alert/clearAlert");
      } catch (reason) {
        this.$store.commit("alert/setAlert", {
          message: reason.request.statusText || reason.message,
          type: "danger",
        });
      }
    },
  },
  head() {
    return {
      title: "Themis - Login",
    };
  },
};
</script>
