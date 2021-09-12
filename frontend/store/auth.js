import UserController from "../controllers/users"

const Status = {
    LOGGED_OUT: "logged_out",
    LOGGING_IN: "logging_in",
    LOGGED_IN: "logged_in"
}

export {Status}

export default {
    namespaced: true,
    state() {
        return {
            status: Status.LOGGED_OUT,
            user: null
        }
    },
    actions: {
        login({commit}, {username, password}) {
            commit('loginStarted', {username})

            UserController.login(this.$config.apiUrl, username, password)
                .then(
                    user => {
                        commit("loginSuccess", user)
                        commit("alert/clearAlert", null, {root: true})
                    },
                    error => {
                        commit("logout")
                        console.log(error)
                        commit("alert/setAlert", {message: error, type: "error"}, {root: true})
                    }
                )

        },
        logout({commit}) {
            UserController.logout()
            commit("logout")
        }
    },
    mutations: {
        loginStarted(state, username) {
            state.status = Status.LOGGING_IN
            state.user = {username}
        },
        loginSuccess(state, user) {
            state.status = Status.LOGGED_IN
            state.user = user
        },
        logout(state) {
            state.status = Status.LOGGED_OUT
            state.user = null
        }
    }
}
