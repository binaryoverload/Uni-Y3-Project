<template>
  <custom-table :rows="rows" :schema="schema" :filter="filter" />
</template>

<script>
import table from "./table.vue"
import { deleteEntity, copyToken } from "~/utils/actions"

const Status = {
  unhealthy: 0,
  warning: 1,
  healthy: 2,
  unknown: 3,
}

const schema = [
  {
    display: "link",
    url: row => "/enrolment-tokens/" + row.id,
    key: "name",
    heading: "Name",
  },
  {
    display: "statusIcon",
    content: row => {
      let expiresAtScore = Status.healthy // Green by default
      let usageScore = Status.healthy

      if (row.usage_limit) {
        const usageRatio = row.usage_current / row.usage_limit

        if (usageRatio >= 0.8) {
          usageScore = Status.unhealthy
        } else if (usageRatio < 0.8 && usageRatio >= 0.6) {
          usageScore = Status.warning
        }

        if (row.usage_current >= row.usage_limit) {
          usageScore = Status.unhealthy
        }
      }

      if (row.expires_at) {
        const timeUntilExpiry = Date.now() - Date.parse(row.expires_at)
        if (isNaN(timeUntilExpiry)) {
          expiresAtScore = Status.unknown
        } else if (timeUntilExpiry < 60 * 10 * 1000) {
          // < 10 Minutes is considered healthy
          expiresAtScore = Status.healthy
        } else if (timeUntilExpiry < 60 * 60 * 1000) {
          // < 1 Hour
          expiresAtScore = Status.warning
        } else {
          expiresAtScore = Status.unhealthy
        }
      }

      // The min score is the worst score
      const minScore = Math.min(expiresAtScore, usageScore)

      return Object.keys(Status).find(key => Status[key] === minScore)
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
    heading: "Expiry Date",
  },
  {
    display: "actions",
    heading: "Actions",
    actions: [
      {
        icon: "copy",
        async onClick(row) {
          copyToken.call(this, row.token)
        },
      },
      {
        icon: "download",
        async onClick(row) {
          let authToken = this.$auth.strategy.token.get()
          if (authToken.startsWith("Bearer ")) {
            authToken = authToken.substring("Bearer ".length)
          }

          let name = `installer-${row.name.replace(" ", "").toLowerCase()}.zip`

          window.location = `${this.$axios.defaults.baseURL}/install-bundle?auth_token=${authToken}&token=${row.token}&name=${name}`
          await this.$swal({
            icon: "success",
            timerProgressBar: true,
            showConfirmButton: false,
            title: "Downloaded installer!",
            text: `Check your downloads folder for the installer. The filename is "${name}"`,
            timer: 5000,
            toast: true,
            position: "top-end",
          })
        },
      },
      {
        icon: "trash",
        variant: "danger",
        async onClick(row) {
          const result = await this.$swal({
            icon: "warning",
            title: "Are you sure?",
            html: `Are you sure you want to delete the token <span class="text-indigo-700">${row.name}</span>? This action is irreversible.`,
            confirmButtonText: "Delete",
            showCancelButton: true,
            focusConfirm: false,
            focusCancel: true,
          })
          if (!result.isConfirmed) {
            return
          }
          deleteEntity.call(
            this,
            `/enrolment-tokens/${row.id}`,
            function () {
              this.$swal({
                icon: "success",
                title: "Deleted token!",
                html: `Successfully delete the token <span class="text-indigo-700">${row.name}</span>.`,
              })
              this.$nuxt.refresh()
            }.bind(this)
          )
        },
        showCondition(row) {
          return row.username !== this.$auth.user.username
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
