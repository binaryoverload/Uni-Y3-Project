<template>
    <div :class="{
        'bg-green-500': status == 'online',
        'bg-amber-500': status == 'warning',
        'bg-red-500': status == 'offline'
    }" class="flex items-center justify-center w-10 text-center text-white rounded-full h-7">
        <font-awesome-icon :icon="icon"/>
    </div>
</template>

<script>

const icons = {
    "online": "check",
    "warning": "exclamation",
    "offline": "times"
}

export default {
    props: {
        schema: {
            type: Object,
            required: true,
        },
        row: {
            type: Object,
            required: true,
        },
    },
    computed: {
        status() {
            return this.schema.key(this.row)
        },
        icon() {
            return icons[this.status]
        }
    }
}
</script>