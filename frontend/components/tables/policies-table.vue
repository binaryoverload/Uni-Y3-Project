<template>
  <custom-table :rows="rows" :schema="schema" :filter="filter" />
</template>

<script>
import table from "./table.vue"

const schema = [
  {
    display: "link",
    url: row => "/policies/" + row.id,
    key: "name",
    heading: "Name",
  },
  {
    display: "text",
    content: row => row.policy_items.length,
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
]

export default {
  components: { CustomTable: table },
  props: {
    rows: {
      type: Array,
      required: true,
    },
    filter: {
      type: String,
    },
  },
  data() {
    return {
      schema,
    }
  },
}
</script>
