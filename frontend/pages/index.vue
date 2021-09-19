<template>
    <div id="app">
        <p>Logged in: {{ $auth.loggedIn }}</p>
        <p>User: {{ $auth.user }}</p>
    </div>
</template>

<script>

export default {
    name: "App"
};
</script>

<style></style>
