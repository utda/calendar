<template>
  <footer class="mt-16 border-t border-border bg-surface">
    <div class="mx-auto max-w-6xl px-4 py-10 text-center text-sm text-fg-muted sm:px-8">
      <p v-if="footer" class="mb-2">{{ footer }}</p>
      <p>
        <a
          href="https://github.com/utda/calendar"
          target="_blank"
          rel="noopener noreferrer"
          class="transition-colors hover:text-primary"
        >
          {{ siteName }}
        </a>
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineProps<{ footer?: string }>()
const { public: pub } = useRuntimeConfig()
const siteName = pub.siteName as string
</script>
