import { defineStore } from "pinia";
import api from "../api";

export const usePrizeStore = defineStore("prizeStore", {
  state: () => ({
    prizes: [],
  }),

  actions: {
    async getPrizeList() {
      try {
        const res = await api.get("/getAllPrizes");

        if (res.status === 200) {
          this.prizes = await res.data;
        }
      } catch (error) {
        console.error(error);
      }
    },

    splicePrize(index, quantity) {
      this.prizes.splice(index, quantity);
    },
  },
});
