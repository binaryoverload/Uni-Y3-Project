<template>
  <div
    class="flex flex-col items-center justify-center w-full h-40 rounded bg-slate-100">
    <p class="font-medium">No {{ entity }} found</p>
    <p class="text-slate-500" v-if="link">
      Click
      <nuxt-link :to="link" class="font-medium text-indigo-700">here</nuxt-link>
      to create one
    </p>
  </div>
</template>

<script>
export default {
  props: {
    entity: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: false,
    },
  },
}
</script>
