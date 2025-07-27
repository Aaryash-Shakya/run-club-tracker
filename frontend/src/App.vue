<script setup lang="ts">
import { RouterView } from 'vue-router'
import AppNavbar from '@/components/AppNavbar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
	<div id="app" class="flex min-h-screen flex-col">
		<AppNavbar />
		<main class="flex-1">
			<RouterView />
		</main>
		<AppFooter />
	</div>
</template>
