<template>
    <nav class="relative h-[150px]">
        <div
            class="absolute top-0 -left-1/10 -translate-y-1/2 z-0"
            :style="{
                width: '120%',
                height: '250px',
                backgroundColor: '#000',
                borderRadius: '100%',
                boxShadow: 'inset 0px 0px 54px 10px #293047',
            }"
        ></div>
        <div class="container my-5 relative z-1">
            <div class="w-full flex items-center justify-center gap-4 py-4">
                <!-- Navigation Links -->
                <router-link
                    to="/"
                    class="navbar-item"
                    :class="[$route.name === 'leaderboard' ? 'navbar-item-selected' : '']"
                >
                    Leaderboard
                </router-link>
                <router-link
                    to="/runners"
                    class="navbar-item"
                    :class="[$route.name === 'runners' ? 'navbar-item-selected' : '']"
                >
                    Runners
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script lang="ts" setup>
import { useRoute } from 'vue-router'

const $route = useRoute()
</script>
