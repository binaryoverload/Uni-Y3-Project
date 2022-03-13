<template>
  <custom-table :rows="rows" :schema="schema" :filter="filter" />
</template>

<script>
import table from "./table.vue"

const schema = [
  {
    display: "link",
    url: row => "/enrolment-tokens/" + row.id,
    key: "name",
    heading: "Name",
  },
  {
    display: "statusIcon",
    key: row => {
      if (!row.expires_at && !row.usage_limit) return "online"

      const usageRatio = row.usage_current / row.usage_limit

      if (usageRatio >= 0.8) {
        return "offline"
      } else if (usageRatio < 0.8 && usageRatio >= 0.6) {
        return "warning"
      }

      if (row.usage_current >= row.usage_limit) return "offline"

      const timeUntilExpiry = Date.now() - row.expires_at.getTime()
      if (isNaN(timeUntilExpiry)) {
        return "unknown"
      } else if (timeUntilExpiry < 60 * 10 * 1000) {
        // < 10 Minutes is considered healthy
        return "online"
      } else if (timeUntilExpiry < 60 * 60 * 1000) {
        // < 1 Hour
        return "warning"
      } else {
        return "offline"
      }
    },
    heading: "Status",
    text: {
      online: "Valid",
      offline: "Expired",
      warning: "Soon to be expired",
      unknown: "Unknown",
    },
  },
  {
    display: "progress",
    startKey: "usage_current",
    endKey: "usage_limit",
    heading: "Usage",
  },
  {
    display: "text",
    key: "expires_at",
    format: "datetime",
    default: "No expiry",
    heading: "Last seen",
  },
  {
    display: "actions",
    heading: "Actions",
    actions: [
      {
        icon: "copy",
        onClick: row => {
          navigator.clipboard.writeText(row.token).then(
            function () {
              alert("Copied enrolment token to clipboard!")
            },
            function (err) {
              console.error("Could not copy enrolment token: ", err)
            }
          )
        },
      },
      {
        icon: "download",
        onClick: row => {
          alert("downloaded!!")
        },
      },
    ],
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
