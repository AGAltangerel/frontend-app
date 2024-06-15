<template>
    <div>
        <h1>Thermal Data</h1>
        <p>This page is protected. You can only see this page if you are logged in.</p>
        {{ list }}
    </div>
</template>

<script lang="ts">
export default {
    name: "ThermalData",
    middleware: 'auth',
    data() {
        return {
            list: []
        }
    },
    async mounted() {
        const response = await this.$axios.get('/thermaldata/');
        const data = await response.data;
        this.list = data;
    }
}
</script>

<style scoped>
</style>