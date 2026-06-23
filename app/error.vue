<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg text-fg">
    <h1 class="font-serif text-2xl font-semibold text-primary">
      {{ error?.statusCode === 404 ? '404 Not Found' : 'An error occurred' }}
    </h1>
    <button
      class="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-fg hover:bg-primary-hover"
      @click="handleError"
    >
      Home page
    </button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'

defineProps<{ error: NuxtError }>()

function handleError() {
  clearError({ redirect: '/' })
}
</script>
