<script setup>
import Header from "../components/Header.vue";
import PrizesList from "../components/admin-panel/PrizesList.vue";
import InteractionMenu from "../components/admin-panel/InteractionMenu.vue";
import { ref } from "vue";

const isPrizes = ref(false); // Флаг окна призов

// Открыть
const openWindow = () => {
  isPrizes.value = !isPrizes.value;
};
</script>

<template>
  <div>
    <Header />
    <div class="container">
      <div class="title-block">
        <h1>Администрирование</h1>
        <router-link to="/logs" class="logs"
          >Логи действий администрации</router-link
        >
      </div>
      <PrizesList :isPrizes="isPrizes" :openWindow="openWindow" />
      <InteractionMenu />
      <router-link to="/prizesList"
        ><h3 class="title">Изменение списка призов</h3></router-link
      >
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 80%;
  margin: 50px auto 0 auto;
  min-height: 100vh;
  max-height: max-content;
}

.title-block {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 50px;
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

.pi {
  font-size: 15px;
}

.logs {
  font-size: 14px;
  font-weight: normal;
  background-color: var(--gray);
  border-radius: 5px;
  height: max-content;
  padding: 10px 20px;
}

.logs:hover {
  background-color: #202020;
}

@media (max-width: 900px) {
  .title-block {
    display: block;
  }

  .title-block a {
    display: block;
    width: max-content;
    text-align: center;
    margin: 30px auto;
  }

  h1 {
    text-align: center;
  }

  .title {
    width: 100%;
    box-sizing: border-box;
  }

  .open-window,
  .menu {
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 430px) {
  h1 {
    font-size: 26px;
    display: block;
  }

  h1 a {
    display: block;
  }

  .title {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
