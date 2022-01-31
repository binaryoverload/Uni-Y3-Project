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
          return this.schema.content(this.row);
        } else {
          return this.schema.content;
        }
      } else {
        const value = this.row[this.schema.key];

        if (value instanceof Date) {
          return value.toLocaleString();
        }

        return value;
      }
    },
  },
};
</script>
