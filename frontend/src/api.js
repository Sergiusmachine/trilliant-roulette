import axios from "axios";

const api = axios.create({
  baseURL: "https://trilliantroulette.ru/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
