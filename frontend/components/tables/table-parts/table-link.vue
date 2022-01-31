<template>
    <a :href="schema.url(row)" class="font-medium text-indigo-600 hover:text-indigo-800 focus:opacity-50">
        {{ text }}
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
    },
    computed: {
        text() {
            if (this.schema.content) {
                if (typeof this.schema.content === "function") {
                    return this.schema.content(this.row)
                } else {
                    return this.schema.content
                }
            } else {
                return this.row[this.schema.key] 
            }
        }
    }
}
</script>