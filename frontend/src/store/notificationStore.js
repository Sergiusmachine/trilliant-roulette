import { defineStore } from "pinia";

export const useNotificationStore = defineStore("notificationStore", {
  state: () => ({
    notification: {
      message: "message",
      condition: undefined,
      show: false,
    },
  }),

  actions: {
    updateNotification(message, condition, show) {
      this.notification.message = message;
      this.notification.condition = condition;
      this.notification.show = show;
    },
  },
});
