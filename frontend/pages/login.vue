<template>
    <div id="app">
        <t-alert :show="!!$store.state.alert.message" :variant="$store.state.alert.type">{{
                $store.state.alert.message
            }}
        </t-alert>
        <form @submit.prevent="submitLogin">
            <label for="username">Username:</label>
            <input type="text" id="username" name="username" v-model="username"/>

            <br/>

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" v-model="password"/>


            <input type="submit" value="Submit"/>
        </form>
    </div>
</template>

<script>
export default {
    data() {
        return {
            username: "",
            password: ""
        };
    },
    middleware: ["guest"],
    methods: {
        async submitLogin() {
            const {username, password} = this;
            try {
                await this.$auth.loginWith('local', {
                    data: {
                        username,
                        password
                    }
                })
                this.$store.commit("alert/clearAlert")
            } catch (reason) {
                this.$store.commit("alert/setAlert", {
                    message: reason.request.statusText || reason.message,
                    type: "danger"
                })
            }
        },
    },
};
</script>
