<template>
  <div
    class="flex items-center px-4 py-2 space-x-4 border rounded border-slate-300">
    <div
      class="flex items-center self-stretch pr-4 -my-2 text-xl border-r border-slate-300 text-slate-600">
      <span>#{{ item.policy_order }}</span>
    </div>
    <div class="space-y-2">
      <p class="text-sm text-slate-600">{{ item.id }}</p>
      <p>
        <font-awesome-icon icon="box-open" class="mr-2 text-slate-600" />{{
          item.type.toTitle()
        }}
      </p>
      <p class="text-sm text-slate-600">
        <span v-if="item.data.action === `install`" class="text-green-600">
          <font-awesome-icon icon="plus" /> install
        </span>
        <span v-else class="text-red-500">
          <font-awesome-icon icon="minus" /> uninstall</span
        >
        &middot;
        <span>{{ item.data.packages.join(", ") }}</span>
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
}
</script>
