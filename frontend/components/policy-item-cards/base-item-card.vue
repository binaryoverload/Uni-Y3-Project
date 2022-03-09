<template>
  <package-item-card v-if="item.type === `package`" :item="item" />
  <command-item-card v-else-if="item.type === `command`" :item="item" />
  <file-item-card v-else-if="item.type === `file`" :item="item" />
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
