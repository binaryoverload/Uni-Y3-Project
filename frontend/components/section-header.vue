<template>
  <div class="mt-8 mb-8">
    <div class="flex items-center">
      <div>
        <p class="font-bold">{{ title }}</p>
        <p class="text-slate-600">{{ subtitle }}</p>
      </div>
      <div class="ml-auto">
        <slot />
      </div>
    </div>
    <hr class="mt-2" />
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    subtitle: {
      type: String,
      required: true,
    },
  },
}
</script>
