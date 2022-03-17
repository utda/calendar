<template>
  <div>
    <v-app-bar color="primary" dark flat>
      <v-toolbar-title>
        <nuxt-link
          style="color: inherit"
          :to="localePath({ name: 'index', query: { u: u } })"
          >{{ 'カレンダー検索' || header }}</nuxt-link
        ></v-toolbar-title
      >
      <v-spacer></v-spacer>

      <v-toolbar-items v-show="url">
        <v-btn
          text
          exact
          :to="localePath({ name: 'index', query: { u: u } })"
          >{{ $t('index') }}</v-btn
        >
        <v-btn text target="_blank" :href="url">
          {{ label }}
          <i class="ml-1 fas fa-external-link-alt"></i>
        </v-btn>
        <template v-if="$i18n.locale == 'ja'">
          <v-btn text exact :to="switchLocalePath('en')">English</v-btn>
        </template>
        <template v-else>
          <v-btn text exact :to="switchLocalePath('ja')">日本語</v-btn>
        </template>
      </v-toolbar-items>
    </v-app-bar>

    <v-container v-if="top" class="mt-5">{{ description }}</v-container>
  </div>
</template>

<script>
export default {
  props: ['header', 'url', 'label', 'u', 'description', 'top'],
  methods: {},
}
</script>
