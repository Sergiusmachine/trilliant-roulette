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
          this.user.name = user.name || "";
          this.user.isAuth = user.isAuth || false;
          this.user.isAdmin = user.isAdmin || false;

          if (this.user.isAuth) {
            const res = await api.post("/checkAdmin", {
              username: this.user.name,
            });

            if (res.status === 200) {
              if (this.user.isAdmin !== res.data.user.admin) {
                this.user.isAdmin = res.data.user.admin;
                user.isAdmin = res.data.user.admin;
                localStorage.setItem("user", JSON.stringify(user));
              }
            }
          }
        } catch (error) {
          if (error?.response?.status === 404) {
            this.logout();
          }
        }
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
