<template>
  <custom-table :rows="rows" :schema="schema" :filter="filter" />
</template>

<script>
import table from "../../components/tables/table.vue";

const schema = [
  {
    display: "statusIcon",
    key: (row) => {
      const timeSinceLastActivity = Date.now() - row.last_activity.getTime();
      if (isNaN(timeSinceLastActivity)) {
        return "unknown";
      } else if (timeSinceLastActivity < 60 * 10 * 1000) {
        // < 10 Minutes is considered healthy
        return "online";
      } else if (timeSinceLastActivity < 60 * 60 * 1000) {
        // < 1 Hour
        return "warning";
      } else {
        return "offline";
      }
    },
    width: "0",
  },
  {
    display: "link",
    url: (row) => row.name,
    key: "name",
    heading: "Name",
  },
  {
    display: "text",
    key: "mac_address",
    heading: "MAC address",
  },
  {
    display: "text",
    key: "last_known_ip",
    heading: "IP address",
  },
  {
    display: "text",
    content: (row) => {
      return row.os_information && row.os_information.name;
    },
    heading: "Operating System",
  },
  {
    display: "text",
    key: "last_activity",
    heading: "Last seen",
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
