<script setup>
import Logo from "../components/Logo.vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../store/userStore";
const userStore = useUserStore();
const router = useRouter();

const name = ref("");
const password = ref("");
const errorMessage = ref("");

const validate = () => {
  if (name.value.length === 0 || password.value.length === 0) {
    errorMessage.value = "Поля не должны быть пустыми";
    return false;
  }

  return true;
};

const validateUsername = () => {
  name.value = name.value.replace(/[^a-zA-Z ]/g, "");
};

const submitForm = async () => {
  if (!validate()) return;

  try {
    await userStore.auth(name.value, password.value);
    await router.push("/roulette");
  } catch (error) {
    errorMessage.value = error.message;
  }
};
</script>

<template>
  <div class="container">
    <div class="auth">
      <Logo class="logo" />
      <h1 class="title">Вход</h1>
      <form class="auth-inputs" @submit.prevent="submitForm">
        <p style="color: brown; margin-top: 0">{{ errorMessage }}</p>
        <input
          v-model="name"
          class="input"
          :maxLength="30"
          @input="validateUsername"
          type="text"
          placeholder="Username"
        />

        <input
          v-model="password"
          class="input"
          :maxLength="30"
          type="password"
          placeholder="Password"
        />

        <button type="submit" class="btn gradient">Войти</button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.logo {
  margin-bottom: 2.5rem;
}
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth {
  position: relative;
  width: 30%;
  margin: 4.4rem auto;
  text-align: center;
  border-radius: 10px;
  padding: 1.8rem 3.1rem 1.25rem 3.1rem;
  background-color: var(--gray);
  -webkit-box-shadow: 0px 0px 70px 9px rgba(127, 56, 81, 0.2);
  -moz-box-shadow: 0px 0px 70px 9px rgba(127, 56, 81, 0.2);
  box-shadow: 0px 0px 70px 9px rgba(127, 56, 81, 0.2);
}

.title {
  margin: 0 0 2.5rem 0;
  font-size: 1.5rem;
}
.input {
  margin-bottom: 20px;
  padding: 10px 13px;
  width: 90%;
  background-color: var(--input);
  border: none;
  border-radius: 5px;
  font-size: 5px;
  color: white;
}
.input:focus {
  outline: none;
}
.btn {
  padding: 8px 22px;
  background-color: #7ecb6c;
  border: none;
  border-radius: 5px;
  margin-bottom: 15px;
  cursor: pointer;
  transition: 0.2s ease;
  font-size: 15px;
}
.btn:hover {
  background-color: #54c839;
}

@media (max-width: 768px) {
  .auth {
    width: 70%;
    padding: 1.5rem;
  }

  .title {
    font-size: 1.2rem;
  }

  .input,
  .btn {
    font-size: 14px;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .auth {
    width: 40%;
  }

  .title {
    font-size: 1.4rem;
  }

  .input,
  .btn {
    font-size: 15px;
  }
}

@media (min-width: 1025px) {
  .auth {
    width: 30%;
  }

  .title {
    font-size: 1.5rem;
  }

  .input,
  .btn {
    font-size: 15px;
  }
}
</style>
