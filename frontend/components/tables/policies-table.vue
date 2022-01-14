<template>
    <custom-table :rows="rows" :schema="schema"/>
</template>

<script>
import table from "./table.vue";

const schema = [
  {
    display: "link",
    url: (row) => row.name,
    key: "name",
    heading: "Name",
  },
  {
    display: "text",
    key: "item_count",
    heading: "Item Count",
  },
  {
    display: "text",
    key: "updated_at",
    heading: "Updated at",
  },
  {
    display: "text",
    key: "created_by",
    heading: "Created by",
  },
];

export default {
  components: { CustomTable: table },
  props: {
      rows: {
          type: Array,
          required: true
      }
  },
  data() {
      return {
          schema
      }
  }
};
</script>
