<script setup>
import Header from "../components/Header.vue";
import InfoPrizes from "../components/roulette/InfoPrizes.vue";
import caseScrollSound from "../sounds/case_scroll.wav";
import Notification from "../components/Notification.vue";
import Winning from "../components/roulette/Winning.vue";
import OfferAuth from "../components/roulette/OfferAuth.vue";
import { useUserStore } from "../store/userStore";
import { ref, onMounted, nextTick, computed } from "vue";
import { usePrizeStore } from "../store/prizeStore.js";
import api from "../api.js";

const prizeStore = usePrizeStore();
const userStore = useUserStore();

const prizes = ref([]);

// Таймер
const timeLeft = ref({
  hours: 0,
  minutes: 0,
  seconds: 0,
});

// Логирование количество рулеток до и после прокрута
const quantityHistory = ref({
  before: null,
  after: null,
});

const fakePrizes = ref([]); // Данные для визуального наполнения рулетки
const result = ref(""); // Случайные результаты для наполнения рулетки
const finalResult = ref({}); // Финальный результат прокрутки
const isActive = ref(false); // Флаг старта анимации рулетки
const isButtonDisabled = ref(false); // Флаг блока кнопки
const isHidden = ref(true); // Флаг для появления окна с выигранным призом
const randomNumber = ref(null); // Случайное число сдвига рулетки
const moveSound = ref(new Audio(caseScrollSound)); // Звук для сдвига рулетки
const onlyGet = ref(false); // Флаг для призов, которые нельзя обменять на валюту
const onlySell = ref(false); // Флаг для призов, которые можно только продать
const isBanned = ref(false); // Проверка на блокировку прокруток
const reasonForBan = ref(""); // Причина бана
const rouletteElement = ref(null);
const caret = ref(null);

onMounted(async () => {
  await userStore.checkAuth();
  await getPrizes();
  await userStore.getQuantity();
  if (userStore.user.isAuth) {
    await checkBan();
  }

  nextTick(() => {
    moveSound.value.volume = 0.1;
    arrayMix();

    if (rouletteElement) {
      rouletteElement.value.addEventListener("transitionend", onAnimationEnd);
    }
  });

  updateCountdown();
  setInterval(updateCountdown, 1000);
});

// Функция для получения случайного элемента массива prizes
const start = () => {
  const totalChance = prizes.value.reduce(
    (sum, prize) => sum + prize.chance,
    0
  );
  const randomChance = Math.floor(Math.random() * totalChance);
  let cumulativeChance = 0;

  for (const prize of prizes.value) {
    cumulativeChance += prize.chance;
    if (randomChance <= cumulativeChance) {
      if (prize.min_quantity && prize.max_quantity) {
        const quantity =
          Math.floor(
            Math.random() * (prize.max_quantity - prize.min_quantity + 1)
          ) + prize.min_quantity;
        prize.quantity = quantity;
        result.value = prize;
      } else {
        result.value = prize;
      }
      break;
    }
  }
};

// // Уменьшаем количество круток после старта рулетки
// const decreaseQuantity = async () => {
//   try {
//     const res = await api.put("/updateQuantity", {
//       username: userStore.user.name,
//     });

//     if (res.status === 200) {
//       userStore.decreaseQuantity();
//     } else {
//       console.error(`Unexpected response status: ${res.status}`);
//     }
//   } catch (error) {
//     console.error("Error during quantity update:", error);
//     if (error.response) {
//       console.error(error.response?.data?.message || "Unknown error");
//     } else {
//       console.error("Network or unexpected error");
//     }
//   }
// };

// Добавляем в массив fakePrizes случайные элементы из массива prizes
const arrayMix = () => {
  while (fakePrizes.value.length < 100) {
    start();
    fakePrizes.value.push(result.value);
  }
};

// Крутим рулетку и получаем финальный результат
const getFinalResult = async () => {
  start();
  isButtonDisabled.value = true;
  finalResult.value = result.value;
  fakePrizes.value[96] = result.value;

  if (finalResult.value.name !== "Respin") {
    try {
      quantityHistory.value.before = userStore.user.quantity;
      userStore.decreaseQuantity();
      quantityHistory.value.after = userStore.user.quantity;
      await getPrize();
    } catch {
      closeWindow();
    }
  } else if (finalResult.value.name === "Respin") {
    userStore.decreaseQuantity();
  }

  isActive.value = true;
  playSoundOnElementChange();
  if (finalResult.value.alternative) {
    onlyGet.value = true;
  }
  getRandomNumber();
  updateRandomNumber();
};

// Получаем быстрый результат
const getFastResult = async () => {
  start();
  isButtonDisabled.value = true;
  finalResult.value = result.value;

  if (finalResult.value.name !== "Respin") {
    try {
      quantityHistory.value.before = userStore.user.quantity;
      userStore.decreaseQuantity();
      quantityHistory.value.after = userStore.user.quantity;
      await getPrize();
    } catch {
      closeWindow();
    }
  }

  isHidden.value = false;
  if (finalResult.value.alternative) {
    onlyGet.value = true;
  }
};

// Получаем список всех призов
const getPrizes = async () => {
  await prizeStore.getPrizeList();
  prizes.value = prizeStore.prizes;
};

// Отправка приза в базу данных
const getPrize = async () => {
  if (finalResult.value.name !== "Respin") {
    try {
      const res = await api.post("/spinRoulette", {
        username: userStore.user.name,
        prizeName: finalResult.value.name,
        url: finalResult.value.url,
        quantity: finalResult.value.quantity ?? null,
      });

      if (res.status !== 200) {
        const errorMessage = await res.text();
        console.error("Ошибка:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Ошибка при выполнении getPrize():", error);
      throw error;
    }
  }
};

// Получаем рандомное значение для класса moveRoulette
const getRandomNumber = () => {
  const min = -15113;
  const max = -14958;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Обновляем значение для класса moveRoulette
const updateRandomNumber = () => {
  randomNumber.value = getRandomNumber();
  document.documentElement.style.setProperty(
    "--random-number",
    randomNumber.value
  );
};

// Метод для проигрывания звука при каждом новом элементе
const playSoundOnElementChange = () => {
  let lastActiveIndex = null;

  const checkActiveElement = () => {
    const rectCaret = caret.value.getBoundingClientRect();
    const elements = rouletteElement.value.children;

    for (let i = 0; i < elements.length; i++) {
      const rectElement = elements[i].getBoundingClientRect();

      // Проверяем, находится ли элемент под указателем caret
      if (
        rectElement.left < rectCaret.right &&
        rectElement.right > rectCaret.left
      ) {
        // Если элемент изменился
        if (i !== lastActiveIndex) {
          // Останавливаем предыдущий звук
          if (moveSound.value) {
            moveSound.value.pause();
            moveSound.value.currentTime = 0;
          }
          // Проигрываем звук для текущего элемента
          moveSound.value.play().catch((error) => {
            console.error("Ошибка при воспроизведении звука:", error);
          });

          // Запоминаем текущий активный элемент
          lastActiveIndex = i;
        }
        break;
      }
    }
    requestAnimationFrame(checkActiveElement);
  };
  requestAnimationFrame(checkActiveElement);
};

// Таймер обратного отсчета
const updateCountdown = () => {
  const now = new Date();
  const targetTime = new Date();
  targetTime.setHours(24, 0, 0, 0);
  const timeLeftMs = targetTime - now;

  timeLeft.value.hours = Math.floor(timeLeftMs / (1000 * 60 * 60));
  timeLeft.value.minutes = Math.floor(
    (timeLeftMs % (1000 * 60 * 60)) / (1000 * 60)
  );
  timeLeft.value.seconds = Math.floor((timeLeftMs % (1000 * 60)) / 1000);

  if (
    timeLeft.value.hours <= 0 &&
    timeLeft.value.minutes <= 0 &&
    timeLeft.value.seconds <= 0
  ) {
    timeLeft.value.hours = 0;
    timeLeft.value.minutes = 0;
    timeLeft.value.seconds = 0;
    location.reload(true);
  }
};

const onAnimationEnd = () => {
  isHidden.value = false;
  if (finalResult.value.name === "Respin") {
    return increaseQuantity();
  }
};

// Проверка на бан
const checkBan = async () => {
  if (!userStore.user.isAuth) {
    return;
  }

  try {
    const res = await api.post("/checkBan", {
      username: userStore.user.name,
    });

    if (res.status === 200) {
      const data = await res.data;
      if (data.reason !== "") {
        isBanned.value = true;
        reasonForBan.value = data.reason;
      }
    }
  } catch (error) {
    console.error("Ошибка при проверке на блокировку", error);
  }
};

const closeWindow = () => {
  isHidden.value = true;
  isButtonDisabled.value = false;
  location.reload(true);
};

// Выбрать имя приза

const buttonDisabled = computed(
  () =>
    isButtonDisabled.value ||
    userStore.user.todayQuantity < 1 ||
    userStore.user.quantity < 1
);
</script>

<template>
  <Header />
  <div class="parent">
    <div class="container">
      <div class="roulette-quantity"></div>
      <div class="scopeHidden">
        <img class="pi-caret-down" src="/assets/logo.svg" alt="" ref="caret" />
        <ul
          :class="{ moveRoulette: isActive }"
          class="list"
          ref="rouletteElement"
        >
          <li
            v-for="prize of fakePrizes"
            class="element"
            :style="{ backgroundColor: prize.color }"
          >
            <img class="img-element" :src="prize.url" alt="" />
          </li>
        </ul>
      </div>

      <div v-if="userStore.user.isAuth">
        <div v-if="!isBanned" class="btn-block">
          <div
            class="fast-start"
            style="
              font-size: 20px;
              padding: 6px;
              min-width: 30px;
              justify-content: center;
              cursor: default;
            "
          >
            {{ userStore.user.quantity }}
          </div>
          <button
            class="start gradient"
            @click="getFinalResult"
            :disabled="buttonDisabled"
          >
            <span v-if="userStore.user.todayQuantity > 0">Start</span>
            <p
              v-if="userStore.user.todayQuantity < 1"
              style="margin: 0; padding: 0"
            >
              {{ timeLeft.hours }}:{{ timeLeft.minutes }}:{{ timeLeft.seconds }}
            </p>
          </button>
          <button
            class="fast-start"
            @click="getFastResult"
            :disabled="buttonDisabled"
          >
            <img
              src="/assets/emoji.gif"
              title="Крутить без анимации"
              width="30"
              height="30"
            />
          </button>
          <InfoPrizes />
        </div>

        <h3 class="technical-work" v-if="isBanned">{{ reasonForBan }}</h3>
      </div>
      <OfferAuth />
    </div>
  </div>
  <Winning
    :isHidden="isHidden"
    :finalResult="finalResult"
    :onlyGet="onlyGet"
    :onlySell="onlySell"
    :closeWindow="closeWindow"
  />
  <Notification />
</template>

<style scoped>
.parent {
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 59.33px);
}
.container {
  width: 80%;
  text-align: center;
  padding: 30px 0;
}

.roulette-quantity {
  font-weight: 400;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 15px;
}

.scopeHidden {
  position: relative;
  overflow: hidden;
  width: 800px;
  margin: 15px auto 0 auto;
  height: 150px;
  border-radius: 80px;
}

.pi-caret-down {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: -2%;
  width: 20px;
  height: 20px;
  z-index: 1;
}

.list {
  position: relative;
  z-index: 0;
  display: inline-flex;
  list-style: none;
  margin: 0;
  padding: 0;
  transition: transform 20s cubic-bezier(0, 0, 0, 1);
}

.element {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  width: 160px;
  border-right: 1px solid #262626;
  box-sizing: border-box;
}

.btn-block {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 30px;
  gap: 10px;
}

.start {
  font-size: 15px;
  font-weight: bold;
  color: #171717;
  padding: 10px 40px;
  border: none;
  cursor: pointer;
  border-radius: 5px;
  text-transform: uppercase;
  position: relative;
  overflow: hidden;
}

.fast-start {
  display: flex;
  align-items: center;
  background-color: #1b1b1b;
  border: 1px solid #232323;
  padding: 3px 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  color: #d3d3d3;
}

.img-element {
  width: 100px;
  height: 100px;
  opacity: 0.7;
}

.moveRoulette {
  transform: translateX(calc(var(--random-number) * 1px));
}

.technical-work {
  color: rgb(217 48 48);
}

@media (max-width: 650px) {
  .container {
    width: 100%;
  }
}

@media (max-width: 1000px) {
  .scopeHidden {
    width: 640px;
  }
  .moveRoulette {
    transform: translateX(calc(var(--random-number) * 1px - 80px));
  }
}

@media (max-width: 800px) {
  .scopeHidden {
    width: 480px;
  }
  .moveRoulette {
    transform: translateX(calc(var(--random-number) * 1px - 160px));
  }
}

@media (max-width: 550px) {
  .scopeHidden {
    width: 320px;
  }
  .moveRoulette {
    transform: translateX(calc(var(--random-number) * 1px - 240px));
  }
}

@media (max-width: 340px) {
  .scopeHidden,
  .roulette-quantity {
    width: 160px;
  }
  .moveRoulette {
    transform: translateX(calc(var(--random-number) * 1px - 320px));
  }
}
</style>
