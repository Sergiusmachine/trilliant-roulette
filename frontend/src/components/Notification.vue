<script setup>
import { watch } from "vue";
import { useNotificationStore } from "../store/notificationStore";
const notificationStore = useNotificationStore();

watch(
  () => notificationStore.notification.show,
  (newValue) => {
    if (newValue) {
      setTimeout(() => {
        notificationStore.updateNotification("", undefined, false);
      }, 4000);
    }
  }
);
</script>

<template>
  <div class="notification" v-if="notificationStore.notification.show">
    <h4
      class="condition"
      v-if="notificationStore.notification.condition === false"
    >
      <i class="pi pi-exclamation-circle"></i>Warning
    </h4>
    <h4
      class="condition"
      v-if="notificationStore.notification.condition === true"
    >
      <i class="pi pi-check"></i>Success
    </h4>
    <p>{{ notificationStore.notification.message }}</p>
  </div>
</template>

<style scoped>
.notification {
  position: fixed;
  bottom: 15px;
  right: 15px;
  width: 350px;
  background-color: #1b1b1b;
  border-radius: 5px;
  padding: 15px 30px;
  transition: ease 0.2s all;
}

.pi-exclamation-circle {
  color: #cc3a3a;
  margin-right: 10px;
}

.pi-check {
  color: green;
  margin-right: 10px;
}

.condition {
  margin: 5px 0 10px 0;
}

@media (max-width: 768px) {
  .notification {
    width: 80%;
    left: 50%;
    transform: translateX(-50%);
    box-sizing: border-box;
    text-align: center;
    padding: 10px 20px;
  }
}

@media (max-width: 450px) {
  .notification {
    width: 90%;
    text-align: center;
  }
}
</style>
