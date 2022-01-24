<template>
    <div class="flex items-center max-w-xs pl-3 border rounded bg-slate-100 border-slate-300 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-opacity-50 focus-within:ring-slate-400">
        <font-awesome-icon icon="search" class="text-slate-400 " />
        <input type="text" v-bind:value="value" v-on:input="$emit('input', $event.target.value)" class="flex-1 bg-transparent border-0 text-slate-600 placeholder-slate-300 focus:outline-0 focus:ring-0" :placeholder="placeholder">
    </div>
</template>

<script>
export default {
    props: {
        placeholder: String,
        value: String,
    }
}
</script>