<template>
  <router-view />
</template>

<script>
  export default {
    mounted() {
      this.$store.dispatch('checkAuth');
      this.$store.dispatch('startAdminCheck')
    }
  }
</script>

<style>
</style>
