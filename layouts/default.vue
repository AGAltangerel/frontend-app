<template>
    <main>
        <header>
            <slot name="header"></slot>
        </header>
        <NuxtPage />
        <footer>
            <slot name="footer"></slot>
        </footer>
    </main>
</template>