<template>
  <div>
    <p class="mb-10 text-5xl font-bold leading-[3rem]">Create Policies</p>
    <section-header
      title="Account information"
      subtitle="For logging in and such." />
    <input-box placeholder="Test" />

    <section-header
      title="Personal information"
      subtitle="Information about the user." />
    <div></div>
  </div>
</template>

<script>
export default {
  layout: "dashboard",
  middleware: "authed",
}
</script>
