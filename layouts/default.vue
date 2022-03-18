<template>
  <v-app dark>
    <v-main>
      <Nuxt />
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: 'DefaultLayout',
}
</script>
<style>
* {
  text-transform: none !important;
}

a {
  text-decoration: none !important;
}

tbody tr:nth-of-type(odd) {
  background-color: rgba(0 0 0 / 5%);
}
</style>
