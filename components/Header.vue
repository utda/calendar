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

      <v-toolbar-items>
        <v-btn exact text :to="localePath({ name: 'index', query: { u } })">
          {{ $t('index') }}
        </v-btn>
        <v-btn exact text :to="localePath({ name: 'analyze', query: { u } })">
          {{ $t('analyze') }}
        </v-btn>

        <v-menu v-if="links && links.length > 0" offset-y>
          <template #activator="{ on, attrs }">
            <v-btn exact text v-bind="attrs" v-on="on">
              <template v-if="linkLabel">
                {{ linkLabel[$i18n.locale] }}
              </template>
              <template v-else>
                {{ $t('links') }}
              </template>
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
            <template v-if="langLabel">
              <v-btn depressed text v-on="on">
                {{ langLabel[$i18n.locale] }}
              </v-btn>
            </template>
            <template v-else>
              <v-btn depressed icon v-on="on">
                <v-icon>mdi-translate</v-icon>
              </v-btn>
            </template>
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
  props: {
    header: {
      type: String,
      default: '',
    },
    links: {
      type: Array,
      default: () => [],
    },
    u: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    top: {
      type: Boolean,
      default: false,
    },
    linkLabel: {
      type: Object,
      default: () => null,
    },
    langLabel: {
      type: Object,
      default: () => null,
    },
  },
}
</script>
