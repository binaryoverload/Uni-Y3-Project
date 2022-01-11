<template>
    <a :href="schema.url(row)" class="font-medium text-indigo-600 hover:text-indigo-800 focus:opacity-50">
        {{ row[schema.key] }}
    </a>
</template>

<script>
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
    }
}
</script>