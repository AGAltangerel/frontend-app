<template>
    <main>
        <div class="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
            <div class="max-w-ws space-y-8">
                <div>
                    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-200">
                        Sign in to your account
                    </h2>
                </div>
                <form class="mt-8 space-y-10" @submit.prevent="login()">
                    <div class="rounded-md shadow-sm -space-y-px w-96">
                        <div>
                            <div>
                                <label for="username" class="sr-only">Username</label>
                                <input 
                                    type="text" 
                                    v-model="username"
                                    id="username"
                                    autocomplete="Altangerel"
                                    required
                                    class="appearance-none rounded-2xl relative block w-full mb-7 bg-zinc-950 px-3 py-3 border text-white border-gray-300 placeholder-gray-200 text-gray-900 rounded-2xl focus:bg-zinc-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Username"
                                />
                            </div>
                            <div>
                                <label for="password" class="sr-only">Password</label>
                                <input 
                                    type="password" 
                                    v-model="password"
                                    name="password"
                                    id="password"
                                    required
                                    class="appearance-none rounded-2xl relative block w-full bg-zinc-950 px-3 py-3 border text-white border-white placeholder-gray-200 text-gray-900 rounded-2xl focus:bg-zinc-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>
                    </div>

                    <v-btn :loading="isLoading" color="primary" x-large type="submit" class="w-96 group relative flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">Login</v-btn>
                    
                    <div v-if="isPasswordInCorrect" class="w-96 mt-5 p-2 mb-4 text-sm text-red-800 rounded-sm bg-red-50 dark:bg-gray-100 dark:text-red-400" role="alert">
                        <p class="font-medium">Please check your username or password!</p>
                    </div>
                </form>
            </div>
        </div>
    </main>
</template>

<script lang="ts">

export default {
    name: "LoginPage",
    data() {
        return {
            username: "" as String,
            password: "" as String,
            isPasswordInCorrect: false as Boolean,
            isLoading: false as Boolean,
        }
    },
    watch: {
        username(newValue: string) {
            if (newValue.length == 0) {
                this.password = '';
                this.isPasswordInCorrect = false;
            }
        },
        password(newValue: string) {
            if (newValue.length == 0) {
                this.isPasswordInCorrect = false;
            }
        }
    },
    methods: {
        async login() {
            this.isLoading = true;
            this.isPasswordInCorrect = false;
            await this.$axios.post('/api/token/', {
                "username": this.username,
                "password": this.password
            }).then((response) => {
                const {access, refresh} = response.data;
                localStorage.setItem('access_token', access);
                localStorage.setItem('refresh_token', refresh);
                this.isLoading = false;
                navigateTo('/');
            })
            .catch((error) => {
                this.isLoading = false; 
                this.isPasswordInCorrect = true;
                console.error('Login failed: ' + error);
            });
        }
    },
    beforeMount() {
        if (localStorage.getItem('access_token')) {
            navigateTo('/');
        }
    },
}
</script>

<style scoped></style>