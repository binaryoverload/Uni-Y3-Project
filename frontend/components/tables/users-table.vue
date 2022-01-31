<template>
  <custom-table :rows="rows" :schema="schema" :filter="filter" />
</template>

<script>
import table from "./table.vue";

const schema = [
  {
    display: "link",
    url: (row) => row.id,
    content: (row) => {
      if (row.first_name && row.last_name) {
        return row.first_name + " " + row.last_name;
      } else {
        return row.username;
      }
    },
    heading: "Name",
  },
  {
    display: "text",
    key: "username",
    heading: "Username",
  },
  {
    display: "text",
    key: "updated_at",
    heading: "Updated at",
  },
  {
    display: "actions",
    heading: "Actions",
    actions: [
      {
        icon: "key",
        onClick(row) {
          alert("reset password for " + row.username);
        },
        showCondition(row) {
          return row.username !== this.$auth.user.username;
        },
      },
    ],
  },
];

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
    };
  },
};
</script>
