<script setup>
import Header from "../components/Header.vue";
import Notification from "../components/Notification.vue";
import api from "../api";
import { ref } from "vue";
import { useUserStore } from "../store/userStore";
const userStore = useUserStore();

import { useNotificationStore } from "../store/notificationStore";
const notificationStore = useNotificationStore();

const password = ref("");
const repeatPassword = ref("");
const isOpenWindow = ref(false);

const updatePassword = async () => {
  if (
    password.value === repeatPassword.value &&
    password.value.length > 4 &&
    password.value.length < 30
  ) {
    try {
      const res = await api.put("/updatePassword", {
        username: userStore.user.name,
        password: password.value,
      });

      if (res.status === 200) {
        showNotification("Пароль изменен", true);
      } else {
        showNotification("Ошибка выполнения смены пароля", false);
      }
    } catch {
      console.error("Ошибка выполнения смены пароля");
    }
  } else if (password.value.length < 4 || password.value.length > 30) {
    showNotification("Пароль должен быть от 4 до 30 символов", false);
  } else {
    showNotification("Пароли не совпадают", false);
  }

  password.value = "";
  repeatPassword.value = "";
};

// Анимация открытия/закрытия окна смены пароля
const openWindow = (windowType) => {
  if (windowType === "isOpenWindow") {
    isOpenWindow.value = !isOpenWindow.value;
  }
};

const showNotification = (message, condition) => {
  notificationStore.updateNotification(message, condition, true);
};
</script>

<template>
  <Header />
  <div class="container">
    <h1 style="margin: 60px 0">Настройки пользователя</h1>
    <h3 class="title" @click="openWindow('isOpenWindow')">
      Смена пароля <i class="pi pi-chevron-down"></i>
    </h3>
    <form
      class="windows"
      :class="{ 'open-window-change-password': isOpenWindow }"
    >
      <input
        class="input"
        type="text"
        :maxLength="30"
        v-model="password"
        placeholder="Введите новый пароль"
      />
      <input
        class="input"
        type="text"
        :maxLength="30"
        v-model="repeatPassword"
        placeholder="Повторите новый пароль"
      />
      <button class="add-roulette-btn" type="button" @click="updatePassword">
        Готово
      </button>
    </form>
  </div>
  <Notification />
</template>

<style scoped>
.container {
  width: 80%;
  margin: 50px auto 0 auto;
  height: 100vh;
}
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 50%;
  padding: 17px 30px;
  background-color: var(--gray);
  border-radius: 5px;
  cursor: pointer;
  margin: 0;
}

.input {
  display: block;
  margin-bottom: 20px;
  width: 80%;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--input);
  color: #d3d3d3;
}

.input:focus {
  outline: none;
}

.windows {
  height: 0;
  width: 50%;
  background-color: var(--gray);
  border-radius: 5px;
  margin-top: 10px;
  margin-bottom: 30px;
  overflow: hidden;
}

.open-window-change-password {
  padding: 30px;
  height: max-content;
}

.add-roulette-btn {
  border: none;
  border-radius: 5px;
  padding: 7px 15px;
  font-size: 13px;
  cursor: pointer;
  background-color: #d3d3d3;
  color: black;
  transition: ease 0.2s all;
}

@media (max-width: 900px) {
  h1 {
    text-align: center;
  }

  .title {
    width: 100%;
    box-sizing: border-box;
  }

  .windows {
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 493px) {
  h1 {
    font-size: 26px;
  }

  .title {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
