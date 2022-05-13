<template>
  <custom-table :rows="rows" :schema="schema" :filter="filter" />
</template>

<script>
import table from "./table.vue"
import { deleteEntity } from "~/utils/actions"

const schema = [
  {
    display: "text",
    key: "name",
    heading: "Name",
  },
  {
    display: "text",
    format: "bytes",
    key: "size",
    heading: "Size",
  },
  {
    display: "text",
    key: "created_at",
    format: "datetime",
    heading: "Created at",
  },
  {
    display: "actions",
    heading: "Actions",
    actions: [
      {
        icon: "trash",
        variant: "danger",
        async onClick(row) {
          const result = await this.$swal({
            icon: "warning",
            title: "Are you sure?",
            html: `Are you sure you want to delete the file <span class="text-indigo-700">${row.name}</span>? This action is irreversible.`,
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
            `/files/${row.id}`,
            function () {
              this.$swal({
                icon: "success",
                title: "Deleted file!",
                html: `Successfully delete the file <span class="text-indigo-700">${row.name}</span>.`,
              })
              this.$nuxt.refresh()
            }.bind(this)
          )
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
