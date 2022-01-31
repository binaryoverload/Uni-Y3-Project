<template>
  <div class="flex items-center space-x-2 justify-left">
    <div
      v-for="(action, index) in actions"
      :key="index"
      @click="action.onClick(row)"
      class="px-2 py-1 rounded cursor-pointer bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-600"
    >
      <font-awesome-icon :icon="action.icon" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    schema: {
      type: Object,
      required: true,
    },
    row: {
      type: Object,
      required: true,
    },
  },
  computed: {
    actions() {
      return this.schema.actions.filter(
        (action) =>
          !action.showCondition || action.showCondition.call(this, this.row)
      );
    },
  },
};
</script>
