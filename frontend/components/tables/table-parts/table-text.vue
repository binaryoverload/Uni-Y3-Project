<template>
    <span>
        {{ row[schema.key] }}
    </span>
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