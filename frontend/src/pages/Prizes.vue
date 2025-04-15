<script setup>
import Header from "../components/Header.vue";
import api from "../api";
import { ref, onMounted, computed } from "vue";
import { useUserStore } from "../store/userStore";
const userStore = useUserStore();

let prizes = [];
let groupedPrizes = ref([]);

const getPrizeList = async () => {
  const res = await api.post("/getPrizeList", {
    username: userStore.user.name,
  });

  if (res.status === 200) {
    prizes = await res.data;

    const quantitySummary = {};

    prizes.forEach((prize) => {
      const quantity = prize.quantity ? parseInt(prize.quantity, 10) : null;

      if (quantity !== null) {
        if (quantitySummary[prize.prize_name]) {
          quantitySummary[prize.prize_name].quantity += quantity;
        } else {
          quantitySummary[prize.prize_name] = {
            prize_name: prize.prize_name,
            quantity: quantity,
            url: prize.url,
          };
        }
      } else {
        groupedPrizes.value.push({
          prize_name: prize.prize_name,
          quantity: "",
          url: prize.url,
        });
      }
    });

    for (const key in quantitySummary) {
      groupedPrizes.value.push(quantitySummary[key]);
    }
  } else {
    console.error("Ошибка сервера:", res.statusText);
  }
};

const onlyGameCurrency = computed(
  () =>
    groupedPrizes.value.length === 0 ||
    groupedPrizes.value.every((prize) => prize.prize_name === "Игровая валюта")
);

onMounted(getPrizeList);
</script>

<template>
  <div>
    <Header />
    <div class="container">
      <div class="title-cont">
        <h1 class="title">Призы ожидающие выдачи:</h1>
        <router-link to="/userLogsPrizes" class="logs"
          >История выигрышей</router-link
        >
      </div>
      <h3 v-if="onlyGameCurrency">Список призов пуст</h3>
      <ul class="list">
        <li
          class="element"
          v-for="prize in groupedPrizes.filter(
            (p) => p.prize_name !== 'Игровая валюта'
          )"
        >
          <img
            v-if="prize.url !== 'null'"
            width="40px"
            height="40px"
            :src="prize.url"
            alt=""
          />
          {{ prize.prize_name }}
          [{{ prize.quantity }}]
        </li>
        <li>
          <p style="margin-top: 40px">
            Игровая валюта:
            <span style="color: green"
              >{{
                groupedPrizes.find(
                  (prize) => prize.prize_name === "Игровая валюта"
                )?.quantity || 0
              }}$</span
            >
          </p>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 80%;
  margin: 50px auto 0 auto;
  height: 100vh;
}

.title {
  font-weight: 600;
}

.list {
  list-style: none;
  margin: 50px 0 0 0;
  padding: 0;
}

.element {
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 20px 0;
  font-size: 18px;
}

.logs {
  font-size: 14px;
  font-weight: normal;
  background-color: var(--gray);
  border-radius: 5px;
  height: max-content;
  padding: 10px 20px;
}

.title-cont {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (max-width: 400px) {
  .title {
    font-size: 25px;
  }
}

@media (max-height: 400px) {
  .container {
    height: max-content;
  }
}

@media (max-width: 900px) {
  .title-cont {
    display: block;
    margin: 0 auto;
    text-align: center;
  }

  .title {
    margin-bottom: 30px;
  }
}
</style>
