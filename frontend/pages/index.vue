<template>
  <div id="app" class="relative h-full">
    <div
      class="absolute left-0 right-0 p-5 text-center pointer-events-none -top-20">
      <h1 class="text-2xl font-bold">Themis</h1>
    </div>

    <div
      class="flex flex-col items-center justify-center h-full min-h-full text-center">
      <div class="mb-24">
        <font-awesome-icon icon="star" size="lg" class="mb-6 text-indigo-800" />
        <h2 class="mb-4 text-3xl font-bold">Let's get started immediately!</h2>
        <p class="text-gray-500 max-w-[30rem] leading-2">
          With Themis, you can add policies to clients. This is to make all your
          clients always maintain the same state.
        </p>
      </div>

      <div class="flex items-center justify-center">
        <nuxt-link
          to="/enrolment-tokens"
          class="p-8 text-left border border-gray-200 rounded-xl w-[17rem] cursor-pointer transition-[border-color,transform] hover:border-indigo-800 hover:scale-105">
          <font-awesome-icon
            icon="ticket-alt"
            size="lg"
            class="mb-8 text-indigo-800" />
          <h3 class="mb-1 font-bold">Enroll a client</h3>
          <p class="text-gray-500 leading-2">
            Need to connect a client? Start by creating an enrollment token.
          </p>
        </nuxt-link>
        <div
          class="flex flex-col items-center justify-center mx-8 transition-opacity opacity-25 hover:opacity-50">
          <div class="w-[2px] h-12 my-1 bg-gray-500" />
          <p class="font-bold text-center text-gray-500 select-none">OR</p>
          <div class="w-[2px] h-12 my-1 bg-gray-500" />
        </div>
        <nuxt-link
          to="/policies"
          class="p-8 text-left border border-gray-200 rounded-xl w-[17rem] cursor-pointer transition-[border-color,transform] hover:border-indigo-800 hover:scale-105">
          <font-awesome-icon
            icon="scroll"
            size="lg"
            class="mb-8 text-indigo-800" />
          <h3 class="mb-1 font-bold">Setup a policy</h3>
          <p class="text-gray-500 leading-2">
            Already got some clients? Create policies to control their state!
          </p>
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "App",
  middleware: "authed",
  layout: "dashboard",
}
</script>
