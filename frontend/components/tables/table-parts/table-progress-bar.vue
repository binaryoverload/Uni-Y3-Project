<template>
  <div>
    <div v-if="row[schema.endKey]" class="flex items-center w-32">
      <span class="flex flex-1 h-3 mr-2 bg-gray-200 rounded-full"
        ><span
          :class="{
            'bg-red-500': percentage >= 0.8,
            'bg-amber-500': percentage >= 0.6 && percentage < 0.8,
            'bg-green-500': percentage < 0.6,
          }"
          class="block rounded-full"
          :style="{ width: percentage * 100 + '%' }"
        ></span></span
      ><span class="text-slate-900">{{ start }}</span
      ><span class="text-slate-400">&nbsp;/&nbsp;{{ end }}</span>
    </div>
    <span v-else
      >{{ start }} <span class="text-gray-400">{{ schema.label }}</span></span
    >
  </div>
</template>

<script>
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
  },
  computed: {
    start() {
      return Number.parseInt(this.row[this.schema.startKey]) || 1;
    },
    end() {
      return Number.parseInt(this.row[this.schema.endKey]) || 1;
    },
    percentage() {
      return Math.min(this.start / this.end, 1);
    },
  },
};
</script>
