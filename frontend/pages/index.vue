<template>
    <div id="app">
        <p>Logged in: {{ $auth.loggedIn }}</p>
        <p>User: {{ $auth.user }}</p>
    </div>
</template>

<script>

export default {
    name: "App",
    middleware: "authed",
    layout: "dashboard",
};
</script>

<style></style>
