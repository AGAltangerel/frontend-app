<template class="container">
    <main>
        <thermal_data></thermal_data>
    </main>
</template>

<script>
import thermal_data from '~/components/thermal_data/index.vue';

export default {
    name: "IndexPage",
    components: {
        thermal_data
    }
}
</script>
<style scoped>
</style>