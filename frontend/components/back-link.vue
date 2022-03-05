<template>
  <p
    @click="$router.go(-1)"
    class="mb-2 min-h-[1.5rem] text-indigo-600 cursor-pointer -mt- hover:text-indigo-700">
    <font-awesome-icon icon="arrow-left" class="mr-2" /><slot />
  </p>
</template>
