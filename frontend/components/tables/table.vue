<template>
      <div class="overflow-x-auto ">
    <table class="w-full my-8 rounded-tl-md rounded-tr-md">
      <thead class="border-b bg-slate-100">
        <th
          v-for="(schemaRow, i) of schema"
          :key="i"
          class="py-4 pl-12 font-bold text-left text-black last:pr-12 whitespace-nowrap"
        >
          {{ schemaRow.heading }}
        </th>
      </thead>
      <tbody>
        <tr
          class="bg-opacity-0 border-b bg-slate-100 hover:bg-opacity-50 border-slate-200 text-slate-600"
          v-for="(row, y) of filteredRows"
          :key="y"
        >
          <td v-for="(schemaRow, x) of schema" :key="x" class="py-4 pl-12 last:pr-12 whitespace-nowrap" :style="{width: schemaRow.width}">
            <component
              :is="getComponentFromDisplay(schemaRow.display)"
              :schema="schemaRow"
              :row="row"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import TableText from "./table-parts/table-text.vue";
import TableLink from "./table-parts/table-link.vue";
import TableProgressBar from "./table-parts/table-progress-bar.vue";
import TableStatusIcon from "./table-parts/table-status-icon.vue";
import TableActions from "./table-parts/table-actions.vue"

const componentMap = {
  text: TableText,
  link: TableLink,
  progress: TableProgressBar,
  statusIcon: TableStatusIcon,
  actions: TableActions,
};

export default {
  props: {
    schema: {
      type: Array,
      required: true,
    },
    rows: {
      type: Array,
      required: true,
    },
    filter: {
      type: String,
      required: false
    }
  },
  methods: {
    getComponentFromDisplay(display) {
      return componentMap[display] || componentMap.text;
    },
  },
  computed: {
    filteredRows() {
      if (!this.filter) return this.rows
      return this.rows.filter(row => Object.values(row).some(value => String(value).toLowerCase().includes(this.filter.toLowerCase())))
    }
  }
};
</script>
