<template>
  <div
    :class="{
      'bg-green-500': status == 'healthy',
      'bg-amber-500': status == 'warning',
      'bg-red-500': status == 'unhealthy',
      'bg-slate-500': status == 'unknown',
    }"
    class="flex items-center justify-center text-center text-white rounded-full w-7 h-7">
    <font-awesome-icon :icon="icon" /><span
      v-if="text && text[status]"
      class="ml-2"
      >text[status]</span
    >
  </div>
</template>

<script>
const icons = {
  healthy: "check",
  warning: "exclamation",
  unhealthy: "times",
  unknown: "question",
}

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
    text: {
      type: Object,
    },
  },
  computed: {
    status() {
      return this.schema.content(this.row)
    },
    icon() {
      return icons[this.status]
    },
  },
}
</script>
