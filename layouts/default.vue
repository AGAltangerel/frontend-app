<template>
    <UContainer :ui="{constrained: 'max-w-2xl'}">
        <header>
            <slot name="header"></slot>
        </header>
        <NuxtPage />
        <footer>
            <slot name="footer"></slot>
        </footer>
    </UContainer>
</template>

<script>
export default {
    name: 'DefaultLayout',
    middleware: 'auth',
}
</script>