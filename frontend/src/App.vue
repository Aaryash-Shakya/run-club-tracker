<script setup lang="ts">
import { RouterView } from 'vue-router'
import Navbar from '@/components/Navbar.vue'
import AppFooter from '@/components/AppFooter.vue'
</script>

<template>
	<div id="app" class="min-h-screen flex flex-col">
		<Navbar />
		<main class="flex-1">
			<RouterView />
		</main>
		<AppFooter />
	</div>
</template>
