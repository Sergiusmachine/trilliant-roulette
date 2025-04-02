<script setup>
import Header from "../components/Header.vue";
import Notification from "../components/Notification.vue";
import CreatePrize from "../components/prizes-list/CreatePrize.vue";
import List from "../components/prizes-list/PrizesList.vue";
</script>

<template>
  <div>
    <Header />
    <div class="container">
      <h1 class="title">Редактор призов</h1>
      <CreatePrize />
      <List />
    </div>
    <Notification />
  </div>
</template>

<style scoped>
.container {
  width: 80%;
  margin: 50px auto 0 auto;
  min-height: 100vh;
  max-height: max-content;
}

@media (max-width: 450px) {
  .container {
    width: 95%;
  }

  .title {
    font-size: 27px;
    text-align: center;
  }
}
</style>
