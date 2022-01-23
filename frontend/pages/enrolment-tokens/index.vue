<template>
<div>
<div class="flex items-end mb-10">
    <p class="text-5xl font-bold leading-[3rem]">Enrolment Tokens</p>
    <div class="ml-auto">
        <t-button>Create new</t-button>
    </div>
</div>
<div>
    <searchbar placeholder="Search by name"></searchbar>
    <enrolment-tokens-table :rows="rows"/>
</div>
</div>
</template>

<script>

const fakeDate = new Date(2022, 6, 30)

 export default {
     layout: "dashboard",
  middleware: "authed",
     data() {
         return {
             rows: [
                 {
                     name: "Hi",
                     expires_at: fakeDate,
                     usage_current: 5
                 },
                 {
                     name: "Hi",
                     expires_at: fakeDate,
                     usage_current: 5,
                     usage_limit: 5
                 },
                 {
                     name: "Hi",
                     expires_at: fakeDate,
                     usage_current: 3,
                     usage_limit: 5
                 },
             ]
         }
     }
 }
</script>
