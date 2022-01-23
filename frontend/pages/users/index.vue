<template>
  <div>
    <div class="flex items-end mb-10">
      <p class="text-5xl font-bold leading-[3rem]">Users</p>
      <div class="ml-auto">
        <t-button>Create new</t-button>
      </div>
    </div>
    <div>
      <searchbar placeholder="Search by name"></searchbar>
    </div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
};
</script>
