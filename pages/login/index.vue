<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div class="max-w-ws w-full space-y-8">
            <div>
                <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sing in to your account
                </h2>
            </div>
            <form class="mt-8 space-y-6" @submit.prevent="login()">
                <div class="rounded-md shadow-sm -space-y-px">
                    <div>
                        <div>
                            <label for="username" class="sr-only">Username</label>
                            <input 
                                type="text" 
                                v-model="username"
                                id="username"
                                autocomplete="Altangerel"
                                required
                                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Username"
                            />
                        </div>
                        <div>
                            <label for="password" class="sr-only">Password</label>
                            <input 
                                type="text" 
                                v-model="password"
                                name="password"
                                id="password"
                                required
                                class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                placeholder="Password"
                            />
                        </div>
                    </div>
                </div>

                <button type="submit" class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Login</button>
            </form>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
    setup() {
        const username = ref('')
        const password = ref('')
        const { $axios } = useNuxtApp();

        const login = async () => {
            const response = await $axios.post('/api/token/', {
                "username": username.value,
                "password": password.value
            }).then((response) => {
                const {access, refresh} = response.data;
                //Store tokens in local storage
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);

                // redirect to a protected route
                navigateTo('/protected');
            })
            .catch((error) => console.error('Login failed: ' + error));
        }
        return {
            username,
            password,
            login
        }
    }
});
</script>

<style scoped></style>