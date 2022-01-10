<template>
    <div class="flex h-full">
        <div class="flex flex-col text-white w-96 bg-slate-900">
            <p class="px-16 py-10 text-4xl font-medium">Themis</p>
            <sidebar-link active icon="scroll">Policies</sidebar-link>
            <sidebar-link icon="desktop">Clients</sidebar-link>
            <sidebar-link icon="ticket-alt">Enrolment Tokens</sidebar-link>
            <sidebar-link icon="user">Users</sidebar-link>
            <sidebar-link icon="sign-out-alt" class="mt-auto mb-4">Logout</sidebar-link>
        </div>
        <div class="flex-1 px-24 py-20">
            <nuxt/>
        </div>
    </div>
</template>
