<script setup>
import { usePrizeStore } from "../../store/prizeStore";
import { ref } from "vue";
const prizeStore = usePrizeStore();

const isWindowInfo = ref(false);

const closeInfo = () => {
  isWindowInfo.value = false;
};

const openInfo = () => {
  isWindowInfo.value = true;
};
</script>

<template>
  <button
    style="font-size: 20px; color: #a8a8a8; padding: 8px"
    @click="openInfo"
  >
    <i class="pi pi-question-circle"></i>
  </button>
  <div :class="isWindowInfo ? 'window-wrapper' : 'hidden'">
    <div class="info-prizes">
      <div
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <h3>Вероятности выпадения</h3>
        <i
          class="pi pi-times"
          style="font-size: 17px; cursor: pointer"
          @click="closeInfo"
        ></i>
      </div>

      <ul style="margin-top: 30px">
        <li v-for="prize in prizeStore.prizes" class="element">
          <div style="display: flex; align-items: center; gap: 15px">
            <img style="width: 25px; height: 25px" :src="prize.url" alt="" />
            <span
              style="filter: brightness(3); text-align: left"
              :style="{ color: prize.color }"
              >{{ prize.name }}</span
            >
          </div>

          <span style="font-weight: 700; margin-right: 10px"
            >{{ prize.chance }}%</span
          >
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
button {
  display: flex;
  align-items: center;
  background-color: #1b1b1b;
  border: 1px solid #232323;
  padding: 3px 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 15px;
  color: #d3d3d3;
}

.info-prizes {
  background-color: var(--black);
  padding: 20px;
  border-radius: 5px;
  width: 350px;
  border: 1px solid #252525;
}

h3 {
  margin: 0;
}

ul {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 300px;
  overflow-y: auto;
}

.element {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 5px;
  padding: 3px 8px;
}
</style>
