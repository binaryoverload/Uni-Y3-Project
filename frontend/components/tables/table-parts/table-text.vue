<template>
  <span>
    {{ text }}
  </span>
</template>

<script>
import prettyBytes from "pretty-bytes"

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
            return value.toLocaleDateString("en-GB")
          }
          return value.toLocaleString("en-GB")
        }

        if (this.schema.format === "datetime") {
          return new Date(value).toLocaleString("en-GB")
        } else if (this.schema.format === "date") {
          return new Date(value).toLocaleDateString("en-GB")
        }

        if (this.schema.format === "bytes") {
          return prettyBytes(value)
        }

        return value
      }
    },
  },
}
</script>
