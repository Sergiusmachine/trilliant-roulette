<script setup>
import api from "../../api";
import { useUserStore } from "../../store/userStore";
const userStore = useUserStore();

const sellPrize = async () => {
  try {
    const res = await api.post("/sellPrize", {
      username: userStore.user.name,
      prizeName: props.finalResult.name,
      quantity:
        props.finalResult.quantity !== undefined
          ? props.finalResult.quantity
          : null,
      alternative:
        props.finalResult.alternative !== undefined
          ? props.finalResult.quantity * props.finalResult.alternative
          : null,
    });
    if (!res.status === 204) {
      const errorMessage = await res.text();
      console.error("Ошибка:", errorMessage);
    }
  } catch (error) {
    console.error("Ошибка при выполнении sellPrize():", error);
  }
  props.closeWindow();
};
const changePrizeName = (item) => {
  if (item.quantity && item.quantity != 1) {
    return `${item.name}(${item.quantity})`;
  } else {
    return item.name;
  }
};

const props = defineProps({
  isHidden: {
    type: Boolean,
    required: true,
    default: true,
  },

  finalResult: {
    type: Object,
    required: true,
    default: () => ({}),
  },

  onlyGet: {
    type: Boolean,
    required: true,
    default: false,
  },

  onlySell: {
    type: Boolean,
    required: true,
    default: false,
  },

  closeWindow: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div class="window-wrapper" v-if="!isHidden">
    <div class="prize-window">
      <h3 class="title-prize-window">Поздравляю! Ты выиграл</h3>
      <img class="img-prize" :src="finalResult.url" alt="" />
      <p class="name-prize">{{ changePrizeName(finalResult) }}</p>
      <div class="buttons">
        <button
          class="get-prize-btn gradient"
          v-if="!onlySell"
          @click="closeWindow"
        >
          Получить
        </button>
        <button class="sell-prize-btn" v-if="onlyGet" @click="sellPrize">
          Продать за
          {{
            finalResult.quantity
              ? finalResult.alternative * finalResult.quantity
              : finalResult.alternative
          }}$
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prize-window {
  width: 40%;
  border-radius: 5px;
  background-color: var(--gray);
  color: white;
  z-index: 3;
  text-align: center;
}

.title-prize-window {
  font-size: 30px;
  font-weight: 300;
}

.img-prize {
  width: 150px;
  height: 150px;
}

.name-prize {
  font-size: 20px;
}

.get-prize-btn {
  padding: 10px 20px;
  color: black;
  font-size: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin: 20px 0 30px auto;
}

.sell-prize-btn {
  padding: 10px 20px;
  background-color: var(--input);
  color: white;
  font-size: 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 40px;
}

.sell-prize-btn:hover {
  background-color: #313131;
}

@media (max-width: 1000px) {
  .prize-window {
    width: 80%;
  }
}

@media (max-width: 440px) {
  .buttons {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
    align-items: center;
    gap: 20px;
  }

  .get-prize-btn {
    width: auto;
    margin-bottom: 0;
    margin-left: 0;
  }

  .sell-prize-btn {
    margin-left: 0;
    width: auto;
    margin-bottom: 30px;
  }
}
</style>
