<template>
  <div class="relative">
    <button
      type="button"
      :aria-label="$t('language')"
      class="inline-flex h-9 items-center gap-1 rounded-md px-2 text-fg-muted transition-colors hover:bg-surface-2 hover:text-fg"
      @click.stop="open = !open"
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </svg>
      <span class="text-sm font-medium">{{ current.toUpperCase() }}</span>
    </button>

    <div
      v-if="open"
      class="absolute right-0 z-50 mt-1 min-w-32 overflow-hidden rounded-md border border-border bg-bg shadow-lg"
    >
      <button
        v-for="l in locales"
        :key="l.code"
        type="button"
        class="block w-full px-4 py-2 text-left text-sm hover:bg-surface-2"
        :class="l.code === current ? 'text-primary font-semibold' : 'text-fg'"
        @click="select(l.code)"
      >
        {{ l.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, locales, setLocale } = useI18n()
const open = ref(false)
const current = computed(() => locale.value)

function select(code: string) {
  // no_prefix: URL（クエリ含む）は変えずに言語のみ切り替える
  setLocale(code as any)
  open.value = false
}

// 外側クリックで閉じる（トグルボタンは @click.stop で伝播を止めている）
onMounted(() => {
  const handler = () => (open.value = false)
  document.addEventListener('click', handler)
  onUnmounted(() => document.removeEventListener('click', handler))
})
</script>
