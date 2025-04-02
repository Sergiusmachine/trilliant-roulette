<script setup>
import api from "../../api";
import { ref, onMounted } from "vue";
import { useUserStore } from "../../store/userStore";
const userStore = useUserStore();

const userPrizes = ref([]); // Массив всех призов всех пользователей
const groupedUserPrizes = ref({}); // Сгруппированные призы по пользователям
const openUser = ref(null); // Для хранения текущего открытого пользователя
const checkedItems = ref([]); // Состояние чекбоксов для каждого пользователя и приза

// Получаем список всех призов из базы данных
const getUserPrizes = async () => {
  try {
    const res = await api.get("/getUserPrizes");

    if (res.status === 200) {
      userPrizes.value = await res.data;
      groupPrizesByUser();
    } else {
      console.error("Ошибка при получении данных:", res.statusText);
    }
  } catch (error) {
    console.error("Ошибка при выполнении sendPrizes():", error);
  }
};

// Удаление призов
const deletePrize = async (username) => {
  try {
    await api.delete("/deletePrize", {
      data: {
        admin: userStore.user.name,
        action: "Выдача приза",
        username,
        checkedItems: checkedItems.value,
      },
    });
    location.reload(true);
  } catch (error) {
    console.error("Ошибка при выполнении removePrizes():", error);
  }
};

// Суммируем quantity для одинаковых призов
const groupPrizesByUser = () => {
  groupedUserPrizes.value = userPrizes.value.reduce((acc, prize) => {
    if (!acc[prize.username]) {
      acc[prize.username] = {};
    }

    if (!acc[prize.username][prize.prize_name]) {
      acc[prize.username][prize.prize_name] =
        prize.quantity < 2 ? [] : { quantity: 0, id: null };
    }

    const prizeQuantity = Number(prize.quantity);
    if (prizeQuantity < 2) {
      if (!Array.isArray(acc[prize.username][prize.prize_name])) {
        acc[prize.username][prize.prize_name] = [];
      }
      acc[prize.username][prize.prize_name].push({
        quantity: prizeQuantity,
        id: prize.id,
      });
    } else {
      if (Array.isArray(acc[prize.username][prize.prize_name])) {
        acc[prize.username][prize.prize_name] = { quantity: 0, id: null };
      }
      acc[prize.username][prize.prize_name].quantity += prizeQuantity;
      acc[prize.username][prize.prize_name].id = prize.id;
    }

    return acc;
  }, {});
};

// Переключаем открытый пользователь
const toggleUserPrizes = (username) => {
  openUser.value = openUser.value === username ? null : username;
};

// Переключаем состояние чекбокса
const toggleCheckbox = (prize) => {
  let existing = checkedItems.value.find((item) => item.id === prize.id);
  if (existing) {
    existing.state = !existing.state;
  } else {
    checkedItems.value.push({
      id: prize.id,
      prizeName: prize.prize_name,
      quantity: prize.quantity,
      state: true,
    });
  }
};

// Проверяем, открыт ли пользователь
const isUserOpen = (username) => {
  return openUser.value === username;
};

// Проверяем, отмечен ли чекбокс по id
const isChecked = (prizeId) => {
  return checkedItems.value.some(
    (item) => item.id === prizeId && item.state === true
  );
};

onMounted(async () => {
  await getUserPrizes();
});

defineProps({
  isPrizes: {
    type: Boolean,
    required: true,
  },

  openWindow: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div>
    <h3 class="title" @click="openWindow">
      Игроки, ожидающие выдачу призов <i class="pi pi-chevron-down"></i>
    </h3>
    <div class="window" :class="{ 'open-window': isPrizes }">
      <ul>
        <li v-for="(prizes, username) in groupedUserPrizes" :key="username">
          <h5 @click="toggleUserPrizes(username)" class="user-title">
            {{ username }}
            <i
              :class="{
                'pi pi-chevron-down pi-user': !isUserOpen(username),
                'pi pi-chevron-up pi-user': isUserOpen(username),
              }"
            ></i>
          </h5>
          <ul v-show="isUserOpen(username)">
            <template v-for="(quantity, prizeName) in prizes" :key="prizeName">
              <li
                v-if="Array.isArray(quantity)"
                v-for="(subQuantity, index) in quantity"
                :key="index"
                class="prize"
                @click.stop="
                  toggleCheckbox({
                    username,
                    prize_name: prizeName,
                    quantity: subQuantity.quantity,
                    id: subQuantity.id,
                  })
                "
              >
                [{{ username }}]: {{ prizeName }} - {{ subQuantity.quantity }}
                <input
                  class="checkbox"
                  type="checkbox"
                  :id="'checkbox-' + subQuantity.id"
                  :checked="isChecked(subQuantity.id)"
                />
              </li>
              <li
                v-else
                class="prize"
                @click.stop="
                  toggleCheckbox({
                    username,
                    prize_name: prizeName,
                    quantity: quantity.quantity,
                    id: quantity.id,
                  })
                "
              >
                [{{ username }}]: {{ prizeName }} - {{ quantity.quantity }}
                <input
                  class="checkbox"
                  type="checkbox"
                  :id="'checkbox-' + quantity.id"
                  :checked="isChecked(quantity.id)"
                />
              </li>
            </template>
            <button class="give-prize" @click="deletePrize(username)">
              Выдано
            </button>
          </ul>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
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

.window {
  height: 0;
  width: 50%;
  background-color: var(--gray);
  border-radius: 5px;
  margin-top: 10px;
  margin-bottom: 30px;
  overflow-y: auto;
  overflow-x: hidden;
}

.user-title {
  font-size: 17px;
  margin: 18px auto;
  cursor: pointer;
}

.prize {
  cursor: pointer;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
}

.checkbox {
  width: 15px;
  height: 15px;
}

.give-prize {
  margin: 15px 0 15px 0;
  border: none;
  border-radius: 5px;
  padding: 7px 15px;
  font-size: 13px;
  cursor: pointer;
  background-color: var(--button);
  color: black;
  transition: ease 0.2s all;
}

.open-window {
  padding: 7px 30px;
  height: max-content;
  max-height: 300px;
}

.pi-user {
  font-size: 10px;
  margin-left: 5px;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

@media (max-width: 900px) {
  .open-window {
    width: 100%;
    box-sizing: border-box;
  }
  .title {
    width: 100%;
    box-sizing: border-box;
  }
}

@media (max-width: 430px) {
  .title {
    width: 100%;
    box-sizing: border-box;
  }
}
</style>
