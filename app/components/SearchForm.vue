<template>
  <div class="rounded-ds border border-border bg-surface p-4 sm:p-5">
    <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
      <!-- 年月テキスト -->
      <div>
        <label class="mb-1 block text-xs font-medium text-fg-muted">
          {{ searchPlaceHolder || $t('date') }}
        </label>
        <input
          v-model="qLocal"
          type="text"
          :placeholder="`YYYY ${$t('or')} YYYY-MM`"
          class="w-full rounded-md border border-border bg-bg px-3 py-2 text-sm text-fg outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          @keyup.enter="emitSearch"
        />
      </div>

      <!-- コレクション複数選択 -->
      <div class="relative">
        <label class="mb-1 block text-xs font-medium text-fg-muted">{{ $t('collection') }}</label>
        <button
          type="button"
          class="flex w-full items-center justify-between rounded-md border border-border bg-bg px-3 py-2 text-left text-sm text-fg"
          @click.stop="open = !open"
        >
          <span class="truncate">
            <template v-if="selected.length">{{ selected.join(', ') }}</template>
            <span v-else class="text-fg-muted">—</span>
          </span>
          <span aria-hidden="true" class="ml-2 text-fg-muted">▾</span>
        </button>
        <div
          v-if="open"
          class="absolute z-50 mt-1 max-h-64 w-full overflow-auto rounded-md border border-border bg-bg p-1 shadow-lg"
          @click.stop
        >
          <label
            v-for="c in collectionsQuery"
            :key="c"
            class="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-2"
          >
            <input type="checkbox" :value="c" v-model="selected" class="accent-[var(--ds-primary)]" />
            <span class="truncate">{{ c }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="mt-4">
      <button
        type="button"
        class="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-fg transition-colors hover:bg-primary-hover"
        @click="emitSearch"
      >
        {{ $t('search') }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  q?: string | null
  collections?: string[]
  collectionsQuery?: string[]
  u?: string
  searchPlaceHolder?: string
}>()

const router = useRouter()
const localePath = useLocalePath()

const open = ref(false)
const qLocal = ref(props.q ?? '')
const selected = ref<string[]>([...(props.collections ?? [])])

watch(
  () => props.q,
  (v) => (qLocal.value = v ?? '')
)
watch(
  () => props.collections,
  (v) => (selected.value = [...(v ?? [])])
)

function emitSearch() {
  const param: { collections: string[]; q?: string } = {
    collections: selected.value,
  }
  if (qLocal.value) param.q = qLocal.value

  router.push(
    localePath({
      path: '/',
      query: { param: JSON.stringify(param), u: props.u },
    })
  )
  open.value = false
}

onMounted(() => {
  const close = () => (open.value = false)
  document.addEventListener('click', close)
  onUnmounted(() => document.removeEventListener('click', close))
})
</script>
