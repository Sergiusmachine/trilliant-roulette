<script setup>
import { useUserStore } from "../../store/userStore";
const userStore = useUserStore();
</script>

<template>
  <div style="margin-top: 50px" v-if="!userStore.user.isAuth">
    <p>Чтобы крутить рулетку необходимо</p>
    <router-link to="/login" class="login gradient">Авторизоваться</router-link>
  </div>
</template>

<style scoped>
.login {
  display: inline-block;
  padding: 7px 20px;
  border-radius: 5px;
  margin-top: 8px;
  font-size: 18px;
  cursor: pointer;
  color: black;
}
</style>
