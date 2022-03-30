<template>
  <div class="flex items-center space-x-2 justify-left">
    <div
      v-for="(action, index) in actions"
      :key="index"
      @click="onClick(action)"
      class="px-2 py-1 rounded cursor-pointer"
      tabindex="0"
      :class="variantClasses(action)">
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
    variant: {
      type: String,
    },
  },
  computed: {
    actions() {
      return this.schema.actions.filter(
        action =>
          !action.showCondition || action.showCondition.call(this, this.row)
      )
    },
  },
  methods: {
    variantClasses(data) {
      if (data.variant) {
        if (data.variant === "danger") {
          return "bg-red-200 hover:bg-red-300 text-red-500 hover:text-red-600 focus:ring-red-500 focus:border-red-500 focus:ring-2  focus:outline-none focus:ring-opacity-50"
        }
      }
      return "bg-slate-200 hover:bg-slate-300 text-slate-500 hover:text-slate-600 focus:ring-slate-400 focus:border-slate-500 focus:ring-2  focus:outline-none focus:ring-opacity-50"
    },
    onClick(action) {
      action.onClick.call(this, this.row)
    },
  },
}
</script>
