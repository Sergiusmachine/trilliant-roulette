<script setup>
import Logo from "./Logo.vue";
import { ref, onMounted } from "vue";
import { useUserStore } from "../store/userStore";
import { useStore } from "vuex";
const store = useStore();
const userStore = useUserStore();

const isList = ref(false);

// Показать модальное окно
const showList = () => {
  isList.value = !isList.value;
};

// Функция выхода с аккаунта
const logout = () => {
  userStore.logout();
  return location.replace("/");
};

onMounted(() => {
  store.dispatch("checkAuth");
});
</script>

<template>
  <header class="header">
    <Logo />
    <div @click="showList" class="container">
      <div class="user-block" v-if="userStore.user.isAuth">
        <i class="pi pi-user"></i>
        <p class="user-name">{{ userStore.user.name }}</p>
        <i class="pi pi-chevron-down"></i>
      </div>
      <div v-if="isList" class="modal">
        <ul class="modal-ul">
          <router-link to="/prizes"
            ><li class="modal-li">Мои призы</li></router-link
          >
          <router-link to="/admin"
            ><li v-if="userStore.user.isAdmin" class="modal-li">
              Администрирование
            </li></router-link
          >
          <router-link to="/settings"
            ><li class="modal-li">Настройки</li></router-link
          >
          <li class="modal-li" @click="logout">Выход</li>
        </ul>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  display: flex;
  justify-content: space-between;
  width: 80%;
  margin: 0 auto 0 auto;
  padding: 30px 0 0 0;
}

.container {
  position: relative;
}

.pi-user {
  margin-right: 20px;
}

.pi-chevron-down {
  font-size: 10px;
}

.login {
  padding: 7px 20px;
  background-color: rgb(0, 139, 0);
  border-radius: 5px;
  margin-right: 10px;
  font-size: 14px;
  cursor: pointer;
}

.singin {
  background-color: inherit;
  margin: 0;
}

.user-block {
  display: flex;
  align-items: center;
  cursor: pointer;
  border-radius: 5px;
  padding: 10px 20px;
}

.reg-block {
  display: flex;
  vertical-align: center;
}

.user-name {
  margin: 0 15px 0 0;
}

.user-block:hover {
  background-color: var(--gray);
}

.modal {
  position: absolute;
  z-index: 1;
  width: 200px;
  right: 0;
  top: 110%;
  border-radius: 5px;
  /* background-color: #1c1c1c; */
  background-color: var(--gray);
}

.modal-ul {
  list-style: none;
  margin: 0;
  padding: 10px 0;
}

.modal-li {
  padding: 8px 20px 8px 20px;
  cursor: pointer;
  user-select: none;
}

.modal-li:hover {
  background-color: #1c1c1c;
}

@media (max-width: 550px) {
  .user-name {
    display: none;
  }

  .header {
    width: 90%;
  }
}
</style>
