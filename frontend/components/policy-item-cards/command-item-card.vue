<template>
  <div
    class="flex items-center min-w-[200px] px-4 py-2 space-x-4 border rounded border-slate-300">
    <div
      class="flex items-center self-stretch pr-4 -my-2 text-xl border-r border-slate-300 text-slate-600">
      <span>#{{ item.policy_order }}</span>
    </div>
    <div class="space-y-2">
      <p class="text-sm text-slate-600">{{ item.id }}</p>
      <p>
        <font-awesome-icon icon="terminal" class="mr-2 text-slate-600" />{{
          item.type.toTitle()
        }}
      </p>
      <p class="text-sm text-slate-600">
        <span class="font-mono">{{ item.data.command }}</span>
        &middot;
        <span>{{ item.data.args.split(" ").length }} args</span>
      </p>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    truncCommand() {
      return (
        this.item.data.command.slice(0, 50) +
        (this.item.data.command.length > 50 ? "..." : "")
      )
    },
  },
}
</script>
