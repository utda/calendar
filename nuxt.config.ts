import tailwindcss from '@tailwindcss/vite'

const siteName = 'カレンダー検索'
const siteDesc = 'カレンダー形式の可視化を行います。'
const shortName = 'カレンダー'
const hostname = 'https://calendar.dl.itc.u-tokyo.ac.jp'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',

  // 旧 Nuxt 2 と同じく全面 SPA（クライアントレンダリング）
  ssr: false,

  app: {
    baseURL: '/',
    head: {
      titleTemplate: '%s',
      title: siteName,
      htmlAttrs: { lang: 'ja' },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'format-detection',
          content: 'telephone=no, email=no, address=no',
        },
        { key: 'description', name: 'description', content: siteDesc },
        { key: 'og:site_name', property: 'og:site_name', content: siteName },
        { key: 'og:type', property: 'og:type', content: 'website' },
        { key: 'og:title', property: 'og:title', content: siteName },
        { key: 'og:description', property: 'og:description', content: siteDesc },
        { name: 'twitter:card', content: 'summary' },
        { name: 'apple-mobile-web-app-capable', content: 'yes' },
        {
          name: 'apple-mobile-web-app-status-bar-style',
          content: 'black-translucent',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  modules: ['@nuxtjs/i18n', '@nuxtjs/color-mode', '@nuxtjs/sitemap'],

  vite: {
    plugins: [tailwindcss()],
  },

  colorMode: {
    classSuffix: '', // <html class="dark"> を付与（Tailwind/DS トークン用）
    preference: 'system',
    fallback: 'light',
  },

  i18n: {
    strategy: 'no_prefix', // URL を変えずに言語切替（クエリ駆動アプリのため）
    defaultLocale: 'ja',
    locales: [
      { code: 'ja', language: 'ja-JP', name: '日本語', file: 'ja.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    bundle: { optimizeTranslationDirective: false },
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  site: { url: hostname, name: siteName },
  sitemap: {},

  nitro: {
    prerender: {
      crawlLinks: false,
      routes: ['/'],
    },
  },

  runtimeConfig: {
    public: { hostname, siteName, shortName, siteDesc },
  },

  typescript: { typeCheck: false },

  devtools: { enabled: true },
})
