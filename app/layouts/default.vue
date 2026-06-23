<template>
  <div class="flex min-h-screen flex-col bg-bg text-fg">
    <AppHeader
      :header="header"
      :links="links"
      :u="u"
      :link-label="linkLabel"
      :lang-label="langLabel"
    />
    <main class="flex-1">
      <slot />
    </main>
    <AppFooter :footer="footer" />
  </div>
</template>

<script setup lang="ts">
// ページが useState('calendarMeta') に書き込んだ結果メタを共有して Header/Footer へ。
import type { CalendarLink } from '~/composables/useCalendar'

const meta = useState<any>('calendarMeta', () => ({}))

const header = computed(() => meta.value?.header ?? '')
const footer = computed(() => meta.value?.footer ?? '')
const u = computed(() => meta.value?.u ?? '')
const links = computed<CalendarLink[]>(() => meta.value?.links ?? [])
const linkLabel = computed(() => meta.value?.link_label ?? null)
const langLabel = computed(() => meta.value?.lang_label ?? null)
</script>
