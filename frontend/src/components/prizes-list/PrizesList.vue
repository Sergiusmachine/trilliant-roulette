<script setup>
import { onMounted, ref, computed } from "vue";
import api from "../../api.js";
import { useUserStore } from "../../store/userStore.js";
import { usePrizeStore } from "../../store/prizeStore.js";
import { useNotificationStore } from "../../store/notificationStore.js";

const notificationStore = useNotificationStore();
const prizeStore = usePrizeStore();
const userStore = useUserStore();

const prizeToDelete = ref({
  name: "",
  url: "",
  index: null,
});
const isConfirmationWindow = ref(false);

const deletePrize = async () => {
  isConfirmationWindow.value = false;
  try {
    const res = await api.post("/destructionPrize", {
      prizeName: prizeToDelete.value.name,
      prizeUrl: prizeToDelete.value.url,
      admin: userStore.user.name,
      action: "Удаление приза",
    });
    if (res.status === 204) {
      prizeStore.splicePrize(prizeToDelete.value.index, 1);
      notificationStore.updateNotification(
        `Приз ${prizeToDelete.value.name} был успешно удален`,
        true,
        true
      );
    }
  } catch (error) {
    if (error.response) {
      notificationStore.updateNotification(
        `Произошла ошибка при удалении приза: ${error.response.data.message}`,
        false,
        true
      );
    }
  }
};
const confirmDelete = (prize, index) => {
  isConfirmationWindow.value = true;
  prizeToDelete.value.name = prize.name;
  prizeToDelete.value.url = prize.url;
  prizeToDelete.value.index = index;
};

const getPrizeList = async () => {
  await prizeStore.getPrizeList();
};

const hideDeleteBtn = computed(
  () => (prize) => prize.name !== "Respin" && prize.name !== "Игровая валюта"
);

onMounted(async () => {
  await getPrizeList();
});
</script>

<template>
  <div class="prizes">
    <div v-for="(prize, index) in prizeStore.prizes" class="prize">
      <div style="display: flex; align-items: center; margin-bottom: 10px">
        <div
          class="view-element"
          style="min-width: 50px; width: 50px; height: 50px; border-radius: 5px"
          :style="{ backgroundColor: prize.color }"
        >
          <img :src="prize.url" alt="" style="width: 30px; height: 30px" />
        </div>
        <h3 style="margin-left: 20px">{{ prize.name }}</h3>
      </div>

      <div style="font-size: 14px">
        <div
          style="
            display: flex;
            justify-content: space-between;
            align-items: center;
          "
          v-if="prize.max_quantity !== null"
        >
          <p>
            Начисляется
            <span style="color: #8d8fff">{{ prize.min_quantity }}</span> -
            <span style="color: #8d8fff">{{ prize.max_quantity }}</span> шт.
          </p>
        </div>

        <p style="margin-top: 0">
          Шанс выпадения:
          <span style="color: #23c4ab">{{ prize.chance }}%</span>
        </p>
        <p v-if="prize.alternative !== null">
          Цена продажи:
          <span style="color: green">{{ prize.alternative }}$</span>
        </p>
      </div>

      <button
        class="create-prize-button"
        :disabled="!hideDeleteBtn(prize)"
        style="padding: 7px 15px; font-size: 14px; margin-top: 20px"
        @click="confirmDelete(prize, index)"
      >
        {{
          prize.name !== "Respin" && prize.name !== "Игровая валюта"
            ? "Удалить"
            : "Не удалять"
        }}
      </button>

      <div class="confirmation-window-bg" v-if="isConfirmationWindow">
        <div class="confirmation-window">
          <p style="text-align: center; font-size: 17px; margin-bottom: 25px">
            Вы действительно хотите удалить приз {{ prizeToDelete.name }}?
          </p>
          <div
            style="
              display: flex;
              justify-content: center;
              gap: 40px;
              margin: 10px 0;
            "
          >
            <button
              class="create-prize-button"
              @click="deletePrize(prize, index)"
              style="margin: 0; padding: 7px 15px; font-size: 14px"
            >
              Да
            </button>
            <button
              class="create-prize-button"
              @click="isConfirmationWindow = false"
              style="margin: 0; padding: 7px 15px; font-size: 14px"
            >
              Нет
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.prizes {
  display: flex;
  flex-wrap: wrap;
  margin-top: 30px;
  gap: 20px;
}

.prize {
  display: flex;
  flex-direction: column;
  width: calc(33.333% - 65px);
  min-width: 250px;
  background-color: var(--gray);
  border-radius: 5px;
  padding: 20px 25px;
  justify-content: space-between;
}

.confirmation-window-bg {
  position: fixed;
  z-index: 2;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  justify-content: center;
  align-items: center;
}

.confirmation-window {
  border: 1px solid black;
  width: 40%;
  border-radius: 5px;
  background-color: #252525;
  color: white;
  z-index: 3;
  padding: 10px 10px;
}

.view-element {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 150px;
  width: 160px;
  box-sizing: border-box;
}

.create-prize-button {
  border: none;
  border-radius: 5px;
  padding: 15px 15px;
  font-size: 13px;
  cursor: pointer;
  background-color: var(--button);
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

@media (max-width: 1174px) {
  .prize {
    width: calc(50% - 60px);
  }
}

@media (max-width: 774px) {
  .prize {
    width: calc(100%);
  }

  .confirmation-window {
    width: 80%;
  }
}

@media (max-width: 450px) {
  .prize {
    width: calc(100%);
  }
}
</style>
