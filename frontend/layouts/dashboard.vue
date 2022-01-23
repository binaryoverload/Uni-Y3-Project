<template>
  <div class="flex h-full">
    <div class="flex flex-col text-white shrink-0 w-80 bg-slate-900">
      <p class="px-16 py-10 text-4xl font-medium">
        <nuxt-link to="/">Themis</nuxt-link>
      </p>
      <sidebar-link to="/policies" icon="scroll">Policies</sidebar-link>
      <sidebar-link to="/clients" icon="desktop">Clients</sidebar-link>
      <sidebar-link to="/enrolment-tokens" icon="ticket-alt"
        >Enrolment Tokens</sidebar-link
      >
      <sidebar-link to="/users" icon="user">Users</sidebar-link>
      <sidebar-button
        @click="$auth.logout()"
        icon="sign-out-alt"
        class="mt-auto mb-4"
        >Logout</sidebar-button
      >
    </div>
    <div class="flex-1 px-24 py-20 overflow-x-auto">
      <nuxt />
    </div>
  </div>
</template>
