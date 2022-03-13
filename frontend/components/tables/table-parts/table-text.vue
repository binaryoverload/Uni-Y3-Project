<template>
  <span>
    {{ text }}
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
        let value = this.row[this.schema.key]

        if (value == null) {
          return this.schema.default
        }

        if (value instanceof Date) {
          if (this.schema.format === "date") {
            return value.toLocaleDateString()
          }
          return value.toLocaleString()
        }

        if (this.schema.format === "datetime") {
          return new Date(value).toLocaleString()
        } else if (this.schema.format === "date") {
          return new Date(value).toLocaleDateString()
        }

        return value
      }
    },
  },
}
</script>
