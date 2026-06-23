<template>
  <Teleport to="body">
    <div
      v-if="event"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 sm:items-center"
      @click.self="$emit('close')"
    >
      <div class="w-full max-w-md rounded-ds border border-border bg-bg p-5 shadow-xl">
        <div class="mb-3 flex items-start justify-between gap-3">
          <a
            :href="event.url"
            target="_blank"
            rel="noopener noreferrer"
            class="font-medium text-primary hover:underline"
          >
            {{ event.name }} ↗
          </a>
          <button
            class="shrink-0 text-fg-muted hover:text-fg"
            aria-label="Close"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>

        <a v-if="event.thumbnail" :href="event.url" target="_blank" rel="noopener noreferrer">
          <img
            :src="event.thumbnail"
            :alt="event.name"
            class="mb-3 max-h-52 w-full rounded-md bg-surface-2 object-contain"
            loading="lazy"
          />
        </a>

        <p v-if="descText" class="mb-3 text-sm text-fg-muted">
          {{ truncate(descText, 140) }}
        </p>

        <table v-if="metaRows.length" class="w-full border-collapse text-sm">
          <tbody>
            <tr v-for="(row, i) in metaRows" :key="i" class="border-b border-border last:border-0">
              <th class="whitespace-nowrap py-1.5 pr-3 text-left align-top font-semibold text-fg-muted">
                {{ row.label }}
              </th>
              <td class="py-1.5 align-top">{{ row.value }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { toDisplayString } from '~/composables/useCalendar'
import type { CalendarEvent } from '~/components/CalendarView.vue'

const props = defineProps<{ event: CalendarEvent | null }>()
defineEmits<{ close: [] }>()

const descText = computed(() =>
  props.event?.description ? toDisplayString(props.event.description) : ''
)

const metaRows = computed(() => {
  const md = props.event?.metadata ?? []
  return md
    .filter((m: any) => m.label !== 'description')
    .map((m: any) => ({ label: m.label, value: toDisplayString(m.value) }))
})

function truncate(s: string, len: number) {
  return s.length <= len ? s : s.slice(0, len) + '...'
}
</script>
