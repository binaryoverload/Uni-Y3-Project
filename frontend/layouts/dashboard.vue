<template>
    <div class="flex h-full">
        <div class="flex flex-col text-white w-96 bg-slate-900">
            <p class="px-16 py-10 text-4xl font-medium"><NuxtLink to="/">Themis</NuxtLink></p>
            <sidebar-link to="/policies" icon="scroll">Policies</sidebar-link>
            <sidebar-link to="/clients" icon="desktop">Clients</sidebar-link>
            <sidebar-link to="/enrolment-tokens" icon="ticket-alt">Enrolment Tokens</sidebar-link>
            <sidebar-link to="/users" icon="user">Users</sidebar-link>
            <sidebar-link to="/logout" icon="sign-out-alt" class="mt-auto mb-4">Logout</sidebar-link>
        </div>
        <div class="flex-1 px-24 py-20">
            <nuxt/>
        </div>
    </div>
</template>
