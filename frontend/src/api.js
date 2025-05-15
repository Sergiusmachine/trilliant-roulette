import axios from "axios";

const api = axios.create({
  baseURL: "http://trilliantroulette.fun/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
