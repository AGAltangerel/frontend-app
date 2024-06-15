<template>
    <main class="flex items-center justify-center">
        <table class="table-fixed">
            <thead>
                <tr>
                    <th v-for="key in keys">
                        {{  key }}
                    </th>
                </tr>
            </thead>
            <tbody v-for="item in list">
                <tr>
                    <td v-for="sub in item">{{ sub }}</td>
                </tr>
            </tbody>
        </table>
    </main>
</template>


<script lang="ts">
export default{
    middleware: 'auth',
    data() {
        return {
            list: [],
            keys: [],
        }
    },
    async mounted() {
        const response = await this.$axios.get('/thermaldata/');
        const data = await response.data;
        this.list = data.results;
        console.log(data);

        if (this.list.length > 0) {
            for (let key in this.list[0]) {
                this.keys.push(key);
            }
        }

    }
}
</script>
