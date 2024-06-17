<template>
    <main class="bg-black">
        <header>
            <slot name="header"></slot>
        </header>
            <NuxtPage />
        <footer>
            <slot name="footer"></slot>
        </footer>
    </main>
</template>

<script>
export default {
    name: 'DefaultLayout',
    middleware: 'auth',
}
</script>