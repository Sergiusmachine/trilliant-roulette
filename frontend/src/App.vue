<script setup>
import Footer from "./components/Footer.vue";
import { onMounted } from "vue";
import { useUserStore } from "./store/userStore";
const userStore = useUserStore();

onMounted(() => {
  userStore.checkAuth();
  userStore.checkAdmin();
});
</script>

<template>
  <router-view />
  <Footer />
</template>

<style scoped></style>
