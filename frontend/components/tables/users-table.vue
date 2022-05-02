<template>
  <custom-table :rows="rows" :schema="schema" :filter="filter" />
</template>

<script>
import table from "./table.vue"
import { deleteEntity } from "~/utils/actions"
import { resetUserPassword } from "~/utils/actions"

const schema = [
  {
    display: "link",
    url: row => "/users/" + row.id,
    content: row => {
      if (row.first_name && row.last_name) {
        return row.first_name + " " + row.last_name
      } else {
        return row.username
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
    format: "datetime",
    heading: "Updated at",
  },
  {
    display: "actions",
    heading: "Actions",
    actions: [
      {
        icon: "key",
        onClick(row) {
          resetUserPassword.call(this, row)
        },
      },
      {
        icon: "trash",
        variant: "danger",
        async onClick(row) {
          const result = await this.$swal({
            icon: "warning",
            title: "Are you sure?",
            html: `Are you sure you want to delete the user <span class="text-indigo-700">${row.username}</span>? This action is irreversible.`,
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
            `/users/${row.id}`,
            function () {
              this.$swal({
                icon: "success",
                title: "Deleted user!",
                html: `Successfully delete the user <span class="text-indigo-700">${row.username}</span>.`,
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
