<template>
    <div v-if="alert" :class="classes">{{ alert.message }}</div>
</template>

<script>
export default {
    computed: {
        alert() {
            return this.$store.state.alert
        },
        classes() {
            let classes = "px-4 py-2 border rounded"

            let type = this.alert.type

            if (type) {
                if (type === "error") {
                    classes = `${classes} bg-red-200 border-red-500`
                } else if (type === "warning") {
                    classes = `${classes} bg-yellow-200 border-yellow-500`
                }
            }

            return classes;
        }
    }
}
</script>