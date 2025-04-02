<script setup>
import Header from "../components/Header.vue";
import { ref, onMounted } from "vue";
import api from "../api";

const props = defineProps({
  titleComponent: { type: String, default: "" },
  fetchUrl: { type: String, required: true },
  actionCorrection: { type: Function, required: true },
  fetchOptions: { type: Object },
  fetchMethod: { type: String, default: "GET" },
});

onMounted(async () => {
  await getLogs();
  logsFiltered.value = logs.value;
});

const logs = ref([]); // Массив с логами
const logsFiltered = ref([]); // Массив с отфильтрованными логами
const uniqueDates = ref([]); // Массив с уникальной датой(месяц, день)
const activeDate = ref("Все"); // Активация кнопки с датой
const toTop = ref(null);

// Получаем список логов
const getLogs = async () => {
  try {
    let res;
    if (props.fetchMethod === "GET") {
      res = await api.get(props.fetchUrl);
    } else {
      res = await api.post(props.fetchUrl, props.fetchOptions);
    }
    if (res.status === 200) {
      const data = res.data;
      logs.value = data;
    }
  } catch (err) {
    console.error(err);
  }
};

// Улучшаем вид даты
const dateCorrection = (dateStr) => {
  const dateObj = new Date(dateStr);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const day = String(dateObj.getDate()).padStart(2, "0");
  const hours = String(dateObj.getHours()).padStart(2, "0");
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const seconds = String(dateObj.getSeconds()).padStart(2, "0");

  if (!uniqueDates.value.includes(`${year}-${month}-${day}`)) {
    uniqueDates.value.push(`${year}-${month}-${day}`);
  }

  const formattedDate = `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`;
  return formattedDate;
};

// Улучшаем вид даты в option
const dateOptionCorrection = (date) => {
  const dateObj = new Date(date);

  const months = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря",
  ];

  const day = dateObj.getDate();
  const month = months[dateObj.getMonth()];
  const formattedDate = `${day} ${month}`;
  return formattedDate;
};

// Кнопка для скролла в начало списка
const scrollTop = () => {
  toTop.value?.scrollIntoView({
    block: "start",
    behavior: "smooth",
  });
};

const setActiveDate = () => {
  if (activeDate.value !== "Все") {
    logsFiltered.value = logs.value.filter((item) =>
      item.timestamp.includes(activeDate.value)
    );
  } else {
    logsFiltered.value = logs.value;
  }
};
</script>

<template>
  <Header />
  <h1 class="title">{{ props.titleComponent }}</h1>
  <div>
    <div class="container">
      <div class="input-cont" style="display: flex; margin-bottom: 40px">
        <select
          name=""
          id=""
          v-model="activeDate"
          @change="setActiveDate"
          class="specific-date"
        >
          <option value="Все">Все</option>
          <option v-for="date in uniqueDates" :key="date" :value="date">
            {{ dateOptionCorrection(date) }}
          </option>
        </select>
      </div>

      <ul class="ul" ref="toTop">
        <li v-for="log in logsFiltered" :key="log.id">
          <span class="date">[{{ dateCorrection(log.timestamp) }}]</span>
          <span v-html="props.actionCorrection(log)"></span>
        </li>
      </ul>
      <button
        v-if="logsFiltered.length > 25"
        class="scroll-top-button"
        @click="scrollTop"
      >
        В начало <i class="pi pi-arrow-up"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.title {
  font-weight: 600;
  width: 80%;
  margin: 50px auto 0 auto;
}

.container {
  width: 80%;
  height: 80vh;
  margin: 0 auto;
  margin-top: 50px;
  background-color: var(--gray);
  border-radius: 5px;
  padding: 50px 0 50px 0;
  overflow: auto;
}

.ul {
  list-style: none;
  padding: 40px 50px;
}

li {
  margin-bottom: 10px;
  /* font-family: "Space Mono", monospace;
  font-weight: 400;
  font-style: normal; */
  font-size: 16px;
}

.date {
  color: #555555;
  margin-right: 5px;
  font-family: "Exo 2", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}

.adm-name {
  color: #5b9870;
}

.button {
  background-color: #cccccc;
  border: none;
  border-radius: 5px;
  padding: 7px 12px;
  cursor: pointer;
  transition: ease 0.2s all;
}

.button:hover {
  background-color: #bbbbbb;
}

.date-sort {
  width: 90%;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin: 0 auto;
}

.specific-date {
  margin-left: 50px;
  background-color: var(--input);
  padding: 12px 20px;
  border-radius: 5px;
  border: none;
  color: rgb(226, 226, 226);
  cursor: pointer;
  width: 30%;
}

.specific-date:focus {
  outline: none;
}

.scroll-top-button {
  display: block;
  background-color: #222222;
  width: 90%;
  padding: 30px 0;
  margin: 0 auto;
  border: none;
  cursor: pointer;
  color: rgb(226, 226, 226);
  font-size: 17px;
}

.pi-arrow-up {
  margin-left: 30px;
  font-size: 14px;
}

.scroll-top-button:hover {
  background-color: #252525;
}

.date-active {
  background-color: #d3d3d3;
  color: #232323;
}

@media (max-width: 1000px) {
  .specific-date {
    width: 50%;
  }
}

@media (max-width: 600px) {
  .container {
    width: 95%;
  }

  .ul {
    list-style: none;
    padding: 40px 20px;
  }

  .input {
    margin: 0 10px 0 20px;
    width: 80%;
  }

  .input-cont {
    width: 90%;
  }

  .specific-date {
    margin-left: 20px;
    width: 70%;
  }
}
</style>
