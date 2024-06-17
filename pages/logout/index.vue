<template>
    <div>
        <h1>Logging out...</h1>
    </div>
</template>

<script>
export default {
    middleware: 'auth',
    async mounted() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        navigateTo('/login');
    }
}
</script>