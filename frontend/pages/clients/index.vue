<template>
<div>
    <div class="mb-10">
<p class="text-5xl font-bold leading-[3rem] mb-4">Clients</p>
<div class="space-y-1">
    <p class="text-slate-600">Clients are added through enrolment tokens.</p>
    <NuxtLink to="/enrolment-tokens" class="flex items-center text-indigo-600 hover:text-indigo-700 hover:underline"><font-awesome-icon icon="arrow-right" class="mr-2"/>Create new enrolment token</NuxtLink>
</div>
        
    </div>
<div>
    <searchbar placeholder="Search by name"></searchbar>
</div>
</div>
</template>

<script>
 export default {
     layout: "dashboard"
 }
</script>
