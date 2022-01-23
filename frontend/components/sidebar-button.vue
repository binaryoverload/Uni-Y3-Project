<template>
  <div
    tabindex="0"
    @click="$emit('click')"
    class="w-full px-16 py-4 transition-colors ease-in-out cursor-pointer text-slate-400 hover:text-slate-200"
  >
    <span class="w-6 mr-4"> <font-awesome-icon :icon="icon" /> </span><slot />
  </div>
</template>

<script>
export default {
  props: {
    icon: String,
  },
};
</script>
