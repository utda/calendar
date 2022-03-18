<template>
  <div>
    <v-app-bar color="primary" dark flat>
      <v-toolbar-title>
        <nuxt-link
          style="color: inherit"
          :to="localePath({ name: 'index', query: { u: u } })"
          >{{ header || $t('calendar_search') }}</nuxt-link
        ></v-toolbar-title
      >
      <v-spacer></v-spacer>

      <v-toolbar-items v-if="links && links.length > 0">
        <v-menu offset-y>
          <template #activator="{ on, attrs }">
            <v-btn exact text v-bind="attrs" v-on="on">
              {{ $t('links') }}
            </v-btn>
          </template>

          <v-list>
            <template v-for="(item, key) in links">
              <v-list-item :key="key" target="_blank" :href="item.value">
                <v-list-item-title
                  >{{ item.label }}
                  <v-icon>mdi-exit-to-app</v-icon></v-list-item-title
                >
              </v-list-item>
            </template>
          </v-list>
        </v-menu>

        <v-menu offset-y>
          <template #activator="{ on }">
            <v-btn depressed icon v-on="on">
              <v-icon>mdi-translate</v-icon>
            </v-btn>
          </template>

          <v-list>
            <v-list-item exact :to="switchLocalePath('ja')">
              <v-list-item-title>日本語</v-list-item-title>
            </v-list-item>
            <v-list-item exact :to="switchLocalePath('en')">
              <v-list-item-title>English</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-toolbar-items>
    </v-app-bar>

    <v-container v-if="top" class="mt-5">{{ description }}</v-container>
  </div>
</template>

<script>
export default {
  props: ['header', 'links', 'u', 'description', 'top'],
  methods: {},
}
</script>
