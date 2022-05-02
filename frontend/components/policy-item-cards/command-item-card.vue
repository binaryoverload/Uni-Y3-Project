<template>
  <div
    class="flex items-center min-w-[200px] px-4 py-2 space-x-4 border rounded border-slate-300">
    <div
      class="flex items-center self-stretch pr-4 -my-2 text-xl border-r border-slate-300 text-slate-600">
      <span>#{{ item.policy_order }}</span>
    </div>
    <div class="space-y-2">
      <p>
        <font-awesome-icon icon="terminal" class="mr-2 text-slate-600" />{{
          item.type.toTitle()
        }}
      </p>
      <p class="text-sm text-slate-600">
        <span class="font-mono">{{ item.data.command }}</span>
        &middot;
        <span>{{ item.data.args.length }} args</span>
      </p>
    </div>
    <div>
      <div
        class="px-2 py-1.5 text-red-500 bg-red-200 rounded cursor-pointer hover:bg-red-300 hover:text-red-600 focus:ring-red-500 focus:border-red-500 focus:ring-2 focus:outline-none focus:ring-opacity-50"
        tabindex="0"
        @click="deleteItem">
        <font-awesome-icon icon="times" class="block" />
      </div>
    </div>
  </div>
</template>

<script>
import { deletePolicyItem } from "~/utils/actions"

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  methods: {
    async deleteItem() {
      deletePolicyItem.call(this)
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
