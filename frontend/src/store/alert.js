export default {
    namespaced: true,
    state: {
        type: null,
        message: null
    },
    mutations: {
        setAlert(state, alert) {
            state.message = alert.message
            state.type = alert.type || null
        },
        clearAlert(state) {
            state.message = null
            state.type = null
        }
    }
}