<template>
  <div
    class="flex items-center min-w-[200px] px-4 py-2 space-x-4 border rounded border-slate-300">
    <div
      class="flex items-center self-stretch pr-4 -my-2 text-xl border-r border-slate-300 text-slate-600">
      <span>#{{ item.policy_order }}</span>
    </div>
    <div class="space-y-2">
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
    <div>
      <nuxt-link
        class="px-2 py-1.5 block text-gray-500 bg-gray-200 rounded cursor-pointer hover:bg-gray-300 hover:text-gray-600 focus:ring-gray-500 focus:border-gray-500 focus:ring-2 focus:outline-none focus:ring-opacity-50"
        :to="`/policy-items/${item.id}`">
        <font-awesome-icon icon="eye" class="block" />
      </nuxt-link>
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
}
</script>
