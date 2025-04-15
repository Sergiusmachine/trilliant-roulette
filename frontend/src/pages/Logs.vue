<script setup>
import BaseLogs from "../components/BaseLogs.vue";

const actionCorrection = (log) => {
  const {
    admin,
    action,
    username,
    quantity,
    prize_name: prizeName,
    newname: newName,
  } = log;
  if (action === "Регистрация пользователя") {
    return `<span style="color: #5b9870">${admin}</span> зарегистрировал <span style="color: #5b9870">${username}</span>`;
  } else if (action === "Смена никнейма") {
    return `<span style="color: #5b9870">${admin}</span> изменил <span style="color: #5b9870">${username}</span> никнейм на ${newName}`;
  } else if (action === "Забрать рулетки") {
    return `<span style="color: #5b9870">${admin}</span> забрал у <span style="color: #5b9870">${username}</span> рулетки(-${quantity})`;
  } else if (action === "Выдача приза") {
    return `<span style="color: #5b9870">${admin}</span> выдал <span style="color: #5b9870">${username}</span> приз ${prizeName}(${quantity})`;
  } else if (action === "Увеличить дневной лимит") {
    return `<span style="color: #5b9870">${admin}</span> добавил <span style="color: #5b9870">${username}</span> дневной лимит на прокруты(+${quantity})`;
  } else if (action === "Выдать рулетки") {
    return `<span style="color: #5b9870">${admin}</span> добавил <span style="color: #5b9870">${username}</span> рулетки(+${quantity})`;
  } else if (action === "Создание приза") {
    return `<span style="color: #5b9870">${admin}</span> создал новый приз <span style="color: #5b9870">${prizeName}</span>`;
  } else if (action === "Удаление приза") {
    return `<span style="color: #5b9870">${admin}</span> удалил приз <span style="color: #5b9870">${prizeName}</span>`;
  } else if (action === "Сбросить пароль") {
    return `<span style="color: #5b9870">${admin}</span> сбросил пароль <span style="color: #5b9870">${username}</span>`;
  }
};
</script>

<template>
  <BaseLogs
    fetchUrl="/getLogs"
    :actionCorrection="actionCorrection"
    fetchMethod="GET"
  />
</template>
