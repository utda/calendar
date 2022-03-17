<template>
  <v-footer class="mt-10" dark>
    <v-container class="py-10 text-center">{{ footer }}</v-container>
  </v-footer>
</template>

<script>
export default {
  props: ['footer'],
}
</script>
