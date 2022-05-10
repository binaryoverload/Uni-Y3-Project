<template>
  <span v-if="condition">{{ data }}</span>
  <span v-else class="text-slate-400">&lt;unset&gt;</span>
</template>

<script>
export default {
  props: {
    condition: {},
    data: {
      required: true,
    },
  },
}
</script>
