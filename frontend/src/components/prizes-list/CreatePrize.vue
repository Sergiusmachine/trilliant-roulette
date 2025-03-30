<script setup>
import { ref } from "vue";
import api from "../../api.js";
import { useUserStore } from "../../store/userStore.js";
import { useNotificationStore } from "../../store/notificationStore.js";
import { usePrizeStore } from "../../store/prizeStore.js";
const notificationStore = useNotificationStore();
const prizeStore = usePrizeStore();
const userStore = useUserStore();

const formCreatePrize = ref({
  name: "",
  chance: null,
  minQuantity: null,
  maxQuantity: null,
  alternative: null,
  backgroundColor: "#000000",
  imageUrl: "",
});

const warnings = ref({
  prizeName: false,
  prizeChance: false,
  prizeImage: false,
  prizeQuantity: false,
  prizeQuantityNull: false,
});

const isCreatePrizeWindow = ref(false); // Показать/скрыть форму добавления приза
const backgroundsStorage = ref([]); // Память используемых фонов при создании приза

const openFormWindow = () => {
  isCreatePrizeWindow.value = true;
  if (localStorage.getItem("backgroundsStorage")) {
    backgroundsStorage.value = JSON.parse(
      localStorage.getItem("backgroundsStorage")
    );
  } else {
    backgroundsStorage.value = [];
  }
};

const createPrize = async () => {
  const isValid = validateForm();
  if (!isValid) return;

  try {
    const res = await api.post("/createPrize", {
      prizeName: formCreatePrize.value.name,
      prizeUrl: formCreatePrize.value.imageUrl,
      backgroundColor: formCreatePrize.value.backgroundColor,
      minQuantity: formCreatePrize.value.minQuantity,
      maxQuantity: formCreatePrize.value.maxQuantity,
      alternative: formCreatePrize.value.alternative,
      chance: formCreatePrize.value.chance,
      admin: userStore.user.name,
      action: "Создание приза",
    });

    if (res.status === 204) {
      updateBackgroundStorage(formCreatePrize.value.backgroundColor);
      notificationStore.updateNotification(
        `Приз ${formCreatePrize.value.name} успешно создан`,
        true,
        true
      );
      isCreatePrizeWindow.value = false;
      resetForm();
      getPrizeList();
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      notificationStore.updateNotification(
        "Такой приз уже существует",
        false,
        true
      );
    } else {
      notificationStore.updateNotification(
        "Ошибка при создании приза",
        false,
        true
      );
    }
  }
};

const updateBackgroundStorage = (newColor) => {
  if (!backgroundsStorage.value.includes(newColor)) {
    backgroundsStorage.value.push(newColor);
  }
  if (backgroundsStorage.value.length > 5) {
    backgroundsStorage.value.shift();
  }
  localStorage.setItem(
    "backgroundsStorage",
    JSON.stringify(backgroundsStorage.value)
  );
};

const validateForm = () => {
  let isValid = true;

  warnings.value.prizeName = false;
  warnings.value.prizeChance = false;
  warnings.value.prizeImage = false;
  warnings.value.prizeQuantity = false;
  warnings.value.prizeQuantityNull = false;

  // Название приза
  if (formCreatePrize.value.name.length < 1) {
    warnings.value.prizeName = !warnings.value.prizeName;
    isValid = false;
    window.scrollTo({ top: 100, behavior: "smooth" });
  }

  // Шанс выпадения
  if (formCreatePrize.value.chance < 1) {
    warnings.value.prizeChance = true;
    isValid = false;
    window.scrollTo({ top: 100, behavior: "smooth" });
  }

  // Наличие картинки
  if (formCreatePrize.value.imageUrl === "") {
    warnings.value.prizeImage = true;
    isValid = false;
    window.scrollTo({ top: 100, behavior: "smooth" });
  }

  // Минимальное кол-во не должно быть больше максимального
  if (
    formCreatePrize.value.minQuantity !== null &&
    formCreatePrize.value.maxQuantity !== null &&
    formCreatePrize.value.minQuantity > formCreatePrize.value.maxQuantity
  ) {
    warnings.value.prizeQuantity = true;
    isValid = false;
    window.scrollTo({ top: 100, behavior: "smooth" });
  }

  // Не может быть заполнено только одно поле количества
  if (
    (formCreatePrize.value.minQuantity === null) !==
    (formCreatePrize.value.maxQuantity === null)
  ) {
    warnings.value.prizeQuantityNull = true;
    isValid = false;
    window.scrollTo({ top: 100, behavior: "smooth" });
  }

  return isValid;
};

const resetForm = () => {
  formCreatePrize.value = {
    name: "",
    chance: null,
    minQuantity: null,
    maxQuantity: null,
    alternative: null,
    backgroundColor: "#000000",
    imageUrl: "",
  };
};

const getPrizeList = async () => {
  await prizeStore.getPrizeList();
};
</script>

<template>
  <div class="add-prize" @click="openFormWindow" v-if="!isCreatePrizeWindow">
    <i class="pi pi-plus" style="margin-right: 20px; color: var(--pink)"></i>
    <p>Добавить новый приз</p>
  </div>

  <form class="new-prize" v-if="isCreatePrizeWindow">
    <h3 style="margin-bottom: 30px">Создание приза</h3>

    <p style="margin: 0; font-size: 20px; color: brown">*</p>
    <p class="warning" v-if="warnings.prizeName">
      Название приза не должно быть пустым
    </p>
    <input
      class="input"
      type="text"
      placeholder="Введите название приза"
      v-model="formCreatePrize.name"
    />

    <p style="margin: 0; font-size: 20px; color: brown">*</p>
    <p class="warning" v-if="warnings.prizeChance">
      Введите корректное значение вероятности выпадения приза
    </p>
    <input
      class="input"
      type="number"
      placeholder="Вероятность выпадения"
      v-model="formCreatePrize.chance"
    />

    <p class="warning" style="color: #fff">
      Если у приза нет min и max количества, то оставьте оба поля пустыми
    </p>
    <p class="warning" v-if="warnings.prizeQuantity">
      Минимальное количество недолжно превышать максимальное
    </p>
    <p class="warning" v-if="warnings.prizeQuantityNull">
      Оба поля должны быть или пустыми, или заполненными
    </p>
    <input
      class="input"
      type="number"
      placeholder="Минимальное количество"
      v-model="formCreatePrize.minQuantity"
      @input="
        formCreatePrize.minQuantity =
          $event.target.value === '' ? null : Number($event.target.value)
      "
    />
    <input
      class="input"
      type="number"
      placeholder="Максимальное количество"
      v-model="formCreatePrize.maxQuantity"
      @input="
        formCreatePrize.maxQuantity =
          $event.target.value === '' ? null : Number($event.target.value)
      "
    />

    <p class="warning" style="color: #fff">
      Если компенсации нет, то оставьте поле пустым
    </p>
    <input
      class="input"
      type="number"
      placeholder="Укажите компенсацию за 1 единицу приза"
      v-model="formCreatePrize.alternative"
      @input="
        formCreatePrize.alternative =
          $event.target.value === '' ? null : Number($event.target.value)
      "
    />

    <p style="margin: 0; font-size: 20px; color: brown">*</p>
    <div
      style="
        padding: 15px 30px;
        border: 1px solid #494949;
        border-radius: 5px;
        display: flex;
        flex-direction: column;
      "
    >
      <p class="warning" v-if="warnings.prizeImage">Загрузите изображение</p>
      <p style="margin-bottom: 10px">Рекомендуемый размер картинки 300x300</p>
      <p style="margin-top: 0">
        Загрузите изображение на фотохостинг, рекомендуемый - Imgbb. После чего
        нажимайте по картинке ПКМ и "Копировать адрес изображения"
      </p>
      <input
        class="input"
        type="text"
        v-model="formCreatePrize.imageUrl"
        placeholder="Прямая ссылка на изображение"
      />
      <ul class="view-roulette" v-if="formCreatePrize.imageUrl !== ''">
        <li
          class="view-element"
          :style="{ backgroundColor: formCreatePrize.backgroundColor }"
        >
          <img class="view-img" :src="formCreatePrize.imageUrl" alt="" />
        </li>
      </ul>

      <div style="display: flex; align-items: center; margin-top: 30px">
        <p style="margin: 0 15px 0 0">Выберите цвет фона:</p>
        <input
          class="background-color-input"
          type="color"
          v-model="formCreatePrize.backgroundColor"
        />
      </div>
      <div
        v-if="backgroundsStorage.length > 0"
        style="
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 20px;
        "
      >
        Недавние:
        <div
          v-for="background in backgroundsStorage"
          class="recent-backgrounds"
          :style="{ backgroundColor: background }"
          @click="formCreatePrize.backgroundColor = background"
        ></div>
      </div>
    </div>

    <button class="create-prize-button" type="button" @click="createPrize">
      Добавить приз
    </button>
  </form>
</template>

<style scoped>
.add-prize {
  display: flex;
  align-items: center;
  margin-top: 50px;
  background-color: var(--gray);
  border-radius: 5px;
  padding: 0 30px;
  cursor: pointer;
  transition: ease 0.2s all;
  border: 1px solid var(--pink);
}

.add-prize:hover {
  background-color: #232323;
}

.new-prize {
  display: flex;
  flex-direction: column;
  background-color: var(--gray);
  border-radius: 5px;
  padding: 0 30px 30px 30px;
  margin-top: 30px;
}

.input {
  margin-bottom: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--input);
  color: #d3d3d3;
}

.input:focus {
  outline: none;
}

.background-color-input {
  width: 50px;
  height: 50px;
  padding: 0;
  background-color: inherit;
  border: none;
  cursor: pointer;
}

.warning {
  margin-top: 0;
  font-size: 13px;
  color: brown;
}

.create-prize-button {
  border: none;
  border-radius: 5px;
  padding: 15px 15px;
  font-size: 13px;
  cursor: pointer;
  background-color: #d3d3d3;
  color: black;
  transition: ease 0.2s all;
  margin-top: 50px;
  font-size: 16px;
}

.create-prize-button:hover {
  background-color: #b7b7b7;
}

.create-prize-button:focus {
  outline: none;
}

.view-roulette {
  display: inline-flex;
  list-style: none;
  margin-top: 30px;
  padding: 0;
  border: 1px solid rgb(84, 84, 84);
  width: max-content;
}

.view-element {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  width: 160px;
  box-sizing: border-box;
}

.view-img {
  width: 100px;
  height: 100px;
}

.recent-backgrounds {
  min-width: 20px;
  width: 20px;
  height: 20px;
  margin-right: 5px;
  border-radius: 5px;
  border: 1px solid #6d6d6d;
  cursor: pointer;
}

@media (max-width: 450px) {
  .add-prize {
    justify-content: center;
  }
}
</style>
