<script setup>
import api from "../../api.js";
import { ref, onMounted, computed, toRaw } from "vue";
import { useUserStore } from "../../store/userStore.js";
const userStore = useUserStore();

const form = ref({
  username: "",
  option: "Выберите действие",
  quantity: 1,
  password: "",
  accNumber: "",
  newName: "",
});
const userInfo = ref({
  username: "",
});
const users = ref([]); // Список всех пользователей
const usersFiltered = ref([]); // Отфильтрованный cписок всех пользователей
const showInfo = ref(false); // Показать/скрыть информацию о пользователе
const succesMessage = ref(""); // Сообщение об успешном выполнении действия
const errorMessage = ref(""); // Сообщение об ошибке при выполнении действия

// Получаем список всех зарегистрированных пользователей
const getUsers = async () => {
  try {
    const res = await api.get("/getUsers");

    if (res.status === 200) {
      users.value = await res.data;
    } else {
      console.error("Ошибка при получении данных:", res.statusText);
    }
  } catch (error) {
    console.error("Ошибка при получении данных:", error);
  }
};

// Получаем информацию о конкретном пользователе
const getUserInfo = async () => {
  if (form.value.username.length === 0) {
    errorMessage.value = "Поля не должны быть пустыми!";
  } else {
    try {
      const res = await api.post("/getInfo", toRaw(form.value));

      if (res.status === 200) {
        const data = await res.data;
        userInfo.value.username = data.username;
        userInfo.value.admin = data.admin ? "Да" : "Нет";
        userInfo.value.quantity = data.quantity;
        userInfo.value.todayQuantity = data.todayquantity;
        userInfo.value.accNumber = data.accnumber;
        showInfo.value = true;
      }
    } catch (error) {
      if (error.response && error.status === 404) {
        errorMessage.value = `Пользователь ${form.value.username} не найден`;
      } else {
        errorMessage.value = `Ошибка: ${
          errorData.error || "Неизвестная ошибка"
        }`;
      }
      console.error("Ошибка при выполнении getUserInfo():", error);
    }
  }
};

// Изменить количество рулеток
const submitQuantity = async () => {
  if (form.value.quantity.length === 0 || form.value.username.length === 0) {
    errorMessage.value = "Поля не должны быть пустыми!";
  } else if (form.value.username === userStore.user.name) {
    errorMessage.value = "Нельзя выдать рулетки самому себе!";
  } else {
    try {
      const res = await api.post("/addQuantity", {
        admin: userStore.user.name,
        action:
          form.value.option === "Выдать рулетки"
            ? "Выдать рулетки"
            : form.value.option === "Увеличить дневной лимит"
            ? "Увеличить дневной лимит"
            : form.value.option === "Забрать рулетки"
            ? "Забрать рулетки"
            : null,
        form: form.value,
      });
      if (res.status === 200) {
        if (form.value.option === "Выдать рулетки") {
          succesMessage.value = `Пользователю ${form.value.username} добавлено ${form.value.quantity} рулеток`;
        } else if (form.value.option === "Увеличить дневной лимит") {
          succesMessage.value = `Пользователю ${form.value.username} увеличен дневной лимит рулеток на ${form.value.quantity}`;
        } else if (form.value.option === "Забрать рулетки") {
          succesMessage.value = `У ${form.value.username} стало на ${form.value.quantity} рулеток меньше`;
        }
      }
    } catch (error) {
      if (error.response && error.status === 404) {
        errorMessage.value = `Пользователь ${form.value.username} не найден или введены некоректные значения`;
      }
      console.error("Ошибка при выполнении submitQuantity():", error);
    }

    form.value.username = "";
    form.value.quantity = 1;
  }
};

// Сбросить пароль игроку
const resetPassword = async () => {
  try {
    const res = await api.post("/resetPassword", {
      admin: userStore.user.name,
      action: form.value.option,
      username: form.value.username,
    });

    if (res.status === 200) {
      succesMessage.value = `Пользователю ${form.value.username} установлен дефолтный пароль`;
    }
  } catch (error) {
    if (error.response && error.status === 404) {
      errorMessage.value = `Пользователь ${form.value.username} не найден`;
    } else {
      errorMessage.value = `${error.status} - ${await error.response}`;
    }
    console.error("Ошибка при сбросе пароля", error);
  }
};

// Отправка формы взаимодействия с игроком
const selectAction = () => {
  succesMessage.value = "";
  errorMessage.value = "";
  showInfo.value = false;

  if (
    form.value.option === "Выдать рулетки" ||
    form.value.option === "Увеличить дневной лимит" ||
    form.value.option === "Забрать рулетки"
  ) {
    submitQuantity();
  }

  if (form.value.option === "Изменить ник") {
    changeName();
  }

  if (form.value.option === "Зарегистрировать") {
    submitUser();
  }

  if (form.value.option === "Информация") {
    getUserInfo();
  }

  if (form.value.option === "Сбросить пароль") {
    resetPassword();
  }
};

// Изменить ник пользователю
const changeName = async () => {
  const username = form.value.username;
  const newUsername = form.value.newName;

  if (username.trim().length === 0 || newUsername.trim().length === 0) {
    errorMessage.value = "Поля текущего и нового ника не должны быть пустыми!";
    return;
  }

  const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
  if (!nameRegex.test(newUsername)) {
    errorMessage.value =
      "Имя и Фамилия должны начинаться с заглавной буквы и быть разделены пробелом!";
    return;
  }

  if (newUsername.length < 4) {
    errorMessage.value = "Слишком короткий ник";
    return;
  }

  try {
    const res = await api.put("/changeName", {
      admin: userStore.user.name,
      action: "Смена никнейма",
      username: form.value.username,
      newName: form.value.newName,
    });

    if (res.status === 200) {
      succesMessage.value = `Ник для ${username} успешно изменен на ${newUsername}`;
    }
  } catch (error) {
    if (error.response && error.status === 404) {
      errorMessage.value = `Пользователь ${username} не найден`;
    } else {
      errorMessage.value = `Ошибка: ${
        error.status + " " + error.response || "Не удалось изменить ник"
      }`;
    }
    console.error("Ошибка при выполнении changeName():", error);
  }

  form.value.username = "";
  form.value.newName = "";
};

// Зарегистрировать нового пользователя
const submitUser = async () => {
  if (
    !/^[A-Z]/g.test(form.value.username) ||
    !/^[A-Z]/g.test(form.value.username[form.value.username.indexOf(" ") + 1])
  ) {
    errorMessage.value = "Имя и Фамилия должны начинаться с заглавной буквы!";
  } else if (
    form.value.username.length === 0 ||
    form.value.password.length < 4 ||
    form.value.password.length > 30 ||
    form.value.accNumber.length === 0
  ) {
    errorMessage.value =
      "Поля не должны быть пустыми! Пароль должен быть от 4 до 30 символов";
  } else if (!form.value.username.includes(" ")) {
    errorMessage.value = "Некорректный никнейм";
  } else {
    try {
      const res = await api.post("/addUser", {
        admin: userStore.user.name,
        action: "Регистрация пользователя",
        username: form.value.username,
        password: form.value.password,
        accNumber: form.value.accNumber,
      });
      if (res.status === 200) {
        succesMessage.value = `Пользователь ${form.value.username} успешно зарегистрирован`;
      }
    } catch (error) {
      if (error.response && error.status === 409) {
        errorMessage.value =
          "Ошибка: Пользователь с таким ником уже существует";
      }
      console.error("Ошибка при выполнении submitUser():", error);
    }

    form.value.username = "";
    form.value.password = "";
    form.value.accNumber = null;
  }
};

const validateQuantity = () => {
  if (form.value.quantity < 1) {
    form.value.quantity = 1;
  }
};

const validateUsername = () => {
  form.value.username = form.value.username.replace(/[^a-zA-Z ]/g, "");
};

// Активация списка юзеров при вводе никнейма для выдачи рулетки
const filteredUsers = () => {
  validateUsername();
  if (form.value.username !== "") {
    usersFiltered.value = users.value.filter((item) => {
      return item.username.startsWith(form.value.username);
    });
  } else {
    usersFiltered.value = [];
  }
};

const showRouletteField = computed(() => {
  return (
    form.value.option === "Выдать рулетки" ||
    form.value.option === "Забрать рулетки" ||
    form.value.option === "Увеличить дневной лимит"
  );
});

onMounted(async () => {
  await getUsers();
});
</script>

<template>
  <div class="menu">
    <h3 class="title-menu">Меню взаимодействия с игроком</h3>
    <form class="form-menu">
      <input
        type="text"
        class="input-menu"
        placeholder="Введите никнейм"
        v-model="form.username"
        :maxLength="30"
        @input="filteredUsers()"
      />
      <ul class="users-list">
        <li
          class="user"
          v-for="user of usersFiltered"
          @click="(form.username = user.username), (usersFiltered = [])"
        >
          {{ user.username }}
        </li>
      </ul>
      <select class="input-menu" v-model="form.option" name="" id="">
        <option disabled selected hidden>Выберите действие</option>
        <option>Выдать рулетки</option>
        <option>Забрать рулетки</option>
        <option>Увеличить дневной лимит</option>
        <option>Информация</option>
        <option>Зарегистрировать</option>
        <option>Изменить ник</option>
        <option>Сбросить пароль</option>
      </select>
      <p
        v-if="showRouletteField"
        style="font-size: 14px; margin: 0 0 5px 0; padding: 0; color: brown"
      >
        Укажите количество, которое хотите добавить или забрать
      </p>
      <input
        v-if="showRouletteField"
        type="number"
        class="input-menu"
        @input="validateQuantity()"
        :min="1"
        v-model="form.quantity"
        placeholder="Количество рулеток"
      />
      <input
        v-if="form.option === 'Зарегистрировать'"
        type="number"
        class="input-menu"
        v-model="form.accNumber"
        placeholder="Номер аккаунта в игре"
      />
      <input
        v-if="form.option === 'Зарегистрировать'"
        v-model="form.password"
        type="text"
        class="input-menu"
        placeholder="Временный пароль"
      />
      <input
        v-if="form.option === 'Изменить ник'"
        v-model="form.newName"
        type="text"
        class="input-menu"
        placeholder="Новый никнейм"
      />
      <div v-if="showInfo" style="margin-bottom: 20px">
        <h3>Информация о пользователе {{ userInfo.username }}:</h3>
        <p>
          Номер аккаунта в игре: <span>{{ userInfo.accNumber }}</span>
        </p>
        <p>
          Права администратора:
          <span
            :style="{ color: userInfo.admin === 'Нет' ? 'brown' : 'green' }"
            >{{ userInfo.admin }}</span
          >
        </p>
        <p>
          Количство рулеток:
          <span :style="{ color: userInfo.quantity > 0 ? 'green' : 'brown' }">{{
            userInfo.quantity
          }}</span>
        </p>
        <p>
          Дневной лимит на прокрутки:
          <span
            :style="{
              color: userInfo.todayQuantity > 0 ? 'green' : 'brown',
            }"
            >{{ userInfo.todayQuantity }}</span
          >
        </p>
        <router-link
          :to="{
            path: '/admLogsPrizes',
            query: { username: form.username },
          }"
          style="text-decoration: underline"
          >История выигрышей</router-link
        >
      </div>
      <button
        v-if="form.option !== 'Выберите действие'"
        class="add-roulette-btn"
        type="button"
        @click="selectAction"
      >
        Готово
      </button>
      <p v-if="succesMessage !== ''" class="succes-message">
        {{ succesMessage }}
      </p>
      <p v-if="errorMessage !== ''" class="error-message">
        {{ errorMessage }}
      </p>
    </form>
  </div>
</template>

<style scoped>
.menu {
  height: max-content;
  width: 50%;
  background-color: var(--gray);
  border-radius: 5px;
  margin-top: 10px;
  margin-bottom: 30px;
  overflow-x: auto;
  padding: 0 30px 30px 30px;
}

.title-menu {
  margin-bottom: 30px;
}

.form-menu {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.input-menu {
  display: block;
  margin-bottom: 20px;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--input);
  color: #d3d3d3;
}

.input-menu:focus {
  outline: none;
}

.succes-message {
  color: #1b9d1b;
  font-size: 15px;
  margin-bottom: 0;
}

.error-message {
  color: brown;
  font-size: 15px;
  margin-bottom: 0;
}

.add-roulette-btn {
  width: max-content;
  border: none;
  border-radius: 5px;
  padding: 7px 15px;
  font-size: 13px;
  cursor: pointer;
  background-color: #d3d3d3;
  color: black;
  transition: ease 0.2s all;
}

.add-roulette-btn:hover {
  background-color: #b9b9b9;
}

.users-list {
  position: absolute;
  width: max-content;
  border-end-end-radius: 5px;
  border-end-start-radius: 5px;
  z-index: 1;
  background-color: #1d1d1d;
  margin-top: 36px;
  max-height: 120px;
  height: max-content;
  overflow: auto;
}

.user {
  padding: 10px 20px;
  cursor: pointer;
}

.user:hover {
  background-color: #1f1f1f;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}
</style>
