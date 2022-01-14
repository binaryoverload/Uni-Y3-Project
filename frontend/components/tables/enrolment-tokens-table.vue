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
    display: "statusIcon",
    key: (row) => {
        if (!row.expires_at && !row.usage_limit) return "online"

        if (row.usage_current >= row.usage_limit) return "offline"

        const timeSinceLastActivity = Date.now() - row.expires_at.getTime()
        if (isNaN(timeSinceLastActivity)) {
            return "unknown"
        } else if (timeSinceLastActivity < (60 * 10 * 1000)) { // < 10 Minutes is considered healthy
            return "online" 
        } else if (timeSinceLastActivity < (60 * 60 * 1000)) { // < 1 Hour
            return "warning"
        } else {
            return "offline"
        }
    },
    heading: "Status",
    text: {
      "online": "Valid",
      "offline": "Expired",
      "warning": "Soon to be expired",
      "unknown": "Unknown"
    }
  },
  {
    display: "progress",
    startKey: "usage_current",
    endKey: "usage_limit",
    heading: "Usage",
  },
  {
    display: "text",
    content: (row) => {
      if (row.expires_at) {
        return row.expires_at
      } else {
        return "No expiry"
      }
    },
    heading: "Last seen",
  },
  {
    display: "actions",
    heading: "Actions",
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
