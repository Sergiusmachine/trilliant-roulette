<template>
  <router-view />
  <Footer />
</template>

<script>
import Footer from './components/Footer.vue'
  export default {
    components: {
      Footer
    },
    mounted() {
      this.$store.dispatch('checkAuth');
      this.$store.dispatch('startAdminCheck')
    }
  }
</script>

<style>
</style>
