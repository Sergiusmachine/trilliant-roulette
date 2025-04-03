import axios from "axios";

const api = axios.create({
  baseURL: "https://trilliantroulett.ru/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
