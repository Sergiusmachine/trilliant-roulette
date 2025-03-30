import { defineStore } from "pinia";
import api from "../api";

export const useUserStore = defineStore("userStore", {
  state: () => ({
    user: {
      name: "",
      quantity: "",
      todayQuantity: "",
      isAuth: false,
      isAdmin: false,
    },
  }),
  actions: {
    async auth(name, password) {
      try {
        const res = await api.post("/login", { name, password });

        this.user = res.data;
        localStorage.setItem("user", JSON.stringify(this.user));
      } catch (error) {
        throw new Error(error.response?.data?.message);
      }
    },

    async checkAuth() {
      const userData = localStorage.getItem("user");

      if (userData) {
        try {
          const user = JSON.parse(userData);
          console.log(user);
          this.user.name = user.name || "";
          this.user.isAuth = user.isAuth || false;
          // this.user.isAdmin = user.isAdmin || false;
        } catch (error) {
          console.error("Ошибка при парсинге данных пользователя:", error);
        }
      }
    },

    async checkAdmin() {
      try {
        const res = await api.post("/checkAdmin", { username: this.user.name });
        if (res.status === 200) {
          this.user.isAdmin = res.data.admin;
        }
      } catch (error) {
        console.error("Ошибка при проверке прав администратора:", error);
      }
    },

    async logout() {
      localStorage.removeItem("user");
    },

    async getQuantity() {
      if (!this.user.isAuth) return;

      try {
        const res = await api.post("/quantity", { username: this.user.name });
        if (res.status === 200) {
          this.user.quantity = res.data.quantity;
          this.user.todayQuantity = res.data.todayquantity;
        } else {
          console.log(
            "Не удалось получить quantity",
            res.response.data.message
          );
        }
      } catch (error) {
        throw new Error(error.response?.data?.message);
      }
    },

    decreaseQuantity() {
      this.user.quantity -= 1;
      this.user.todayQuantity -= 1;
    },
  },
});
