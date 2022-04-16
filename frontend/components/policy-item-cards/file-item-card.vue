<template>
  <nuxt-link
    class="flex items-center min-w-[200px] px-4 py-2 space-x-4 border rounded border-slate-300 bg-slate-50 hover:bg-slate-100"
    :to="`/policy-items/${item.id}`">
    <div
      class="flex items-center self-stretch pr-4 -my-2 text-xl border-r border-slate-300 text-slate-600">
      <span>#{{ item.policy_order }}</span>
    </div>
    <div class="space-y-2">
      <p>
        <font-awesome-icon icon="file" class="mr-2 text-slate-600" />{{
          item.type.toTitle()
        }}
      </p>
      <p class="text-sm text-slate-600">
        <span>
          {{ item.data.destination }} &middot;
          {{ item.data.permissions.toString(8) }} (<span class="font-mono">{{
            perms
          }}</span
          >)
        </span>
      </p>
    </div>
  </nuxt-link>
</template>

<script>
import { permsNumToLetter } from "~/utils/strings"

export default {
  props: {
    item: {
      type: Object,
      required: true,
    },
  },
  computed: {
    perms() {
      return permsNumToLetter(0o751)
    },
  },
}
</script>
