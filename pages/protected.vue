<template>
    <div>
        <h1>Protected Page</h1>
        <p>This page is protected. You can only see this page if you are logged in.</p>
    </div>
</template>

<script>
export default {
    middleware: 'auth'
};
</script>

<style scoped>
</style>