<template>
  <header
    class="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-bg px-4 sm:px-8"
  >
    <!-- ロゴ / タイトル -->
    <NuxtLink
      :to="indexTo"
      class="shrink-0 truncate transition-opacity hover:opacity-80"
    >
      <span
        class="font-serif text-lg font-semibold tracking-tight text-primary sm:text-2xl"
      >
        {{ header || $t('calendar_search') }}
      </span>
    </NuxtLink>

    <!-- デスクトップナビ -->
    <nav class="hidden items-center gap-5 sm:flex">
      <NuxtLink :to="indexTo" :class="navLink">{{ $t('index') }}</NuxtLink>
      <NuxtLink v-if="u" :to="statsTo" :class="navLink">{{ $t('stats') }}</NuxtLink>

      <!-- 外部リンクメニュー -->
      <div v-if="links && links.length" class="relative">
        <button type="button" :class="navLink" @click.stop="linksOpen = !linksOpen">
          {{ linkLabelText }}
          <span aria-hidden="true">▾</span>
        </button>
        <div
          v-if="linksOpen"
          class="absolute right-0 z-50 mt-1 min-w-56 overflow-hidden rounded-md border border-border bg-bg shadow-lg"
        >
          <a
            v-for="(item, i) in links"
            :key="i"
            :href="item.value"
            target="_blank"
            rel="noopener noreferrer"
            class="block px-4 py-2 text-sm text-fg hover:bg-surface-2"
          >
            {{ item.label }} ↗
          </a>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </nav>

    <!-- モバイル: トグル群 + ハンバーガー -->
    <div class="flex items-center gap-1 sm:hidden">
      <ThemeToggle />
      <LanguageSwitcher />
      <button
        type="button"
        class="p-2 text-fg-muted hover:text-primary"
        aria-label="Menu"
        @click.stop="menuOpen = !menuOpen"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
    </div>

    <!-- モバイルメニュー -->
    <nav
      v-if="menuOpen"
      class="absolute left-0 right-0 top-16 border-b border-border bg-bg sm:hidden"
    >
      <div class="flex flex-col gap-1 p-4">
        <NuxtLink :to="indexTo" :class="[navLink, 'py-2']" @click="menuOpen = false">{{ $t('index') }}</NuxtLink>
        <NuxtLink v-if="u" :to="statsTo" :class="[navLink, 'py-2']" @click="menuOpen = false">{{ $t('stats') }}</NuxtLink>
        <template v-if="links && links.length">
          <div class="pt-2 text-xs font-semibold uppercase text-fg-muted">{{ linkLabelText }}</div>
          <a
            v-for="(item, i) in links"
            :key="i"
            :href="item.value"
            target="_blank"
            rel="noopener noreferrer"
            :class="[navLink, 'py-2']"
          >{{ item.label }} ↗</a>
        </template>
      </div>
    </nav>
  </header>
</template>

<script setup lang="ts">
import type { CalendarLink } from '~/composables/useCalendar'

const props = defineProps<{
  header?: string
  links?: CalendarLink[]
  u?: string
  linkLabel?: Record<string, string> | null
  langLabel?: Record<string, string> | null
}>()

const { locale, t } = useI18n()
const menuOpen = ref(false)
const linksOpen = ref(false)

const navLink =
  'text-sm font-medium text-fg-muted transition-colors hover:text-primary sm:text-base'

const query = computed(() => (props.u ? { u: props.u } : {}))
const indexTo = computed(() => ({ path: '/', query: query.value }))
const statsTo = computed(() => ({ path: '/stats', query: query.value }))

const linkLabelText = computed(
  () => props.linkLabel?.[locale.value] ?? t('links')
)

onMounted(() => {
  const close = () => {
    linksOpen.value = false
    menuOpen.value = false
  }
  document.addEventListener('click', close)
  onUnmounted(() => document.removeEventListener('click', close))
})
</script>
