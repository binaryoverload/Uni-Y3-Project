<template>
    <div :class="styles">
        <span class="w-6 mr-4">
            <font-awesome-icon :icon="icon" :class="active ? 'text-indigo-600 ' : ''"/>
        </span><slot/>
        </div>
</template>

<script>
export default {
    props: {
        active: Boolean,
        icon: String
    },
    computed: {
        styles() {
            let common = "w-full px-16 py-4 text-xl cursor-pointer"
            return this.active ? common + " text-white bg-indigo-400 hover:bg-opacity-20 bg-opacity-10" : common + " text-slate-400 hover:text-slate-200"
        }
    }
}
</script>