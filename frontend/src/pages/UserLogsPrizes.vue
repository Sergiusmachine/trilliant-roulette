<script setup>
import BaseLogs from "../components/BaseLogs.vue";
import { useUserStore } from "../store/userStore";
const userStore = useUserStore();

const actionCorrection = (log) => {
  const {
    prize_name: prizeName,
    prize_quantity: prizeQuantity,
    user_quantity_before: userQuantityBefore,
    user_quantity_after: userQuantityAfter,
    alternative,
  } = log;

  if (alternative === null) {
    return `<span style="font-family: 'Exo 2', sans-serif; word-spacing: 5px;">
                    <span style="color: #1b9d1b; font-size: 14px; font-family: 'Exo 2', sans-serif;">(${userQuantityBefore})</span>
                    <i class="pi pi-arrow-right" style="font-size: 10px;"></i>
                    <span style="color: #cd3636; font-size: 14px; font-family: 'Exo 2', sans-serif;">(<i class="pi pi-caret-down" style="font-size: 10px;"></i>${userQuantityAfter})</span> -
                    Вы получили приз <span style="color: #5b9870;">${prizeName}</span><span style="font-family: 'Exo 2', sans-serif;">(${prizeQuantity})</span>
                </span>
                `;
  } else {
    return `<span style="font-family: 'Exo 2', sans-serif; word-spacing: 5px;">
                    <span style="color: #1b9d1b; font-size: 14px; font-family: 'Exo 2', sans-serif;">(${userQuantityBefore})</span>
                    <i class="pi pi-arrow-right" style="font-size: 10px;"></i>
                    <span style="color: #cd3636; font-size: 14px; font-family: 'Exo 2', sans-serif;">(<i class="pi pi-caret-down" style="font-size: 10px;"></i>${userQuantityAfter})</span> -
                    Вы обменяли приз <span style="color: #4f4f4f; text-decoration: line-through;">${prizeName}(${prizeQuantity})</span>
                    на виртуальную валюту <span style="color: #5b9870;">${alternative}$</span>
                 </span>
                `;
  }
};
</script>
<template>
  <div>
    <BaseLogs
      titleComponent="История выигрышей"
      fetchUrl="/getUserLogsPrizes"
      :actionCorrection="actionCorrection"
      :fetchOptions="{
        username: userStore.user.name,
      }"
      fetchMethod="POST"
    />
  </div>
</template>
<style scoped></style>
