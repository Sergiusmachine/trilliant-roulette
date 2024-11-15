<template>
    <div class="container">
        <div class="auth">
            <Logo class="logo"/>
            <h1 class="title">Вход</h1>
            <form class="auth-inputs" @submit.prevent="submitForm">
                <input v-model="name" class="input" :maxLength="30" @input="validateUsername" type="text" placeholder="Ваш ник на сервере">
                <input v-model="password" class="input" :maxLength="16" type="password" placeholder="Пароль">
                <button type="submit" class="btn">Войти</button>
            </form>
        </div>
    </div>
</template>

<script>
import Logo from '../components/Logo.vue'

export default {
    components: {
        Logo,
    },

    data() {
        return {
            name: '',
            password: ''
        }
    },

    methods: {
        // Валидация
        validate() {
            if (this.name.length > 4 
                && /^[a-zA-Z ]+$/.test(this.name) 
                && this.password.length > 4 
                && this.password.length <= 16) {
                return true;
            } else if (this.password.length < 4 || this.password.length > 16) {
                alert('Пароль должен быть от 4 до 16 символов');
            } else if (this.name.length === 0 || this.password.length === 0) {
                alert('Поля не должны быть пустыми')
            } else {
                alert('Введите корректный ник-нейм');
            }
            return false; // Возвращаем false, если валидация не прошла
        },

        validateUsername() {
            this.name = this.name.replace(/[^a-zA-Z ]/g, '')
        },

        // Метод для отправки формы
        async submitForm() {
            if (!this.validate()) return;
            
            try {
                // Попытка входа через Vuex store
                await this.$store.dispatch('login', { name: this.name, password: this.password });

                // Перенаправляем только в случае успешной авторизации
                this.$router.push('/roulette');
            } catch (error) {
                // В случае ошибки выводим сообщение
                alert(error.message);  // Показываем ошибку от сервера (например, "Неправильное имя пользователя или пароль")
            }
        }
    },

    // Метод для проверки статуса авторизации при загрузке приложения
    mounted() {
        const isAuthenticated = localStorage.getItem('isAuthenticated');
        const username = localStorage.getItem('username');

        if (isAuthenticated === 'true') {
            // Если авторизация сохранена в localStorage
            this.$store.state.user.authorization = true;  
            this.$store.state.user.name = username;  
            this.$router.push('/roulette'); // Перенаправление, если уже авторизован
        }
    }
}
</script>



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
        width: 30%;
        /* max-width: 22rem; */
        margin: 4.4rem auto;
        text-align: center;
        border-radius: 5px;
        padding: 1.8rem 3.1rem 1.25rem 3.1rem;
        background-color: rgb(66, 85, 131, .2);
    }
    .title {
        margin: 0 0 2.5rem 0;
        font-size: 1.5rem;
    }
    .input {
        margin-bottom: 20px;
        padding: 10px 13px;
        width: 90%;
        background-color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 15px;
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
        transition: .2s ease;
        font-size: 15px;
    }
    .btn:hover {
        background-color: #54c839;
    }

    /* Для мобильных устройств */
@media (max-width: 768px) {
    .auth {
        width: 70%; /* Ширина блока авторизации на мобильных устройствах */
        padding: 1.5rem; /* Уменьшаем отступы */
    }

    .title {
        font-size: 1.2rem; /* Уменьшаем размер шрифта заголовка */
    }

    .input,
    .btn {
        font-size: 14px; /* Уменьшаем размер шрифта для полей ввода и кнопок */
    }
}

/* Для планшетов */
@media (min-width: 769px) and (max-width: 1024px) {
    .auth {
        width: 40%; /* Ширина блока авторизации на планшетах */
    }

    .title {
        font-size: 1.4rem; /* Уменьшаем размер шрифта заголовка */
    }

    .input,
    .btn {
        font-size: 15px; /* Размер шрифта для полей ввода и кнопок */
    }
}

/* Для больших экранов */
@media (min-width: 1025px) {
    .auth {
        width: 30%; /* Ширина блока авторизации на десктопах */
    }

    .title {
        font-size: 1.5rem; /* Размер шрифта заголовка */
    }

    .input,
    .btn {
        font-size: 15px; /* Размер шрифта для полей ввода и кнопок */
    }
}
</style>