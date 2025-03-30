<template>
    <header class="header">
        <Logo />
        <div @click="showList" class="container">
            <div class="user-block" v-if="$store.state.user.authorization">
                <i class="pi pi-user"></i>
                <p class="user-name">{{ $store.state.user.name }}</p>
                <i class="pi pi-chevron-down"></i>
            </div>
            <div v-if="isList" class="modal">
                <ul class="modal-ul">
                    <router-link to="/prizes"><li class="modal-li">Мои призы</li></router-link>
                    <router-link to="/admin"><li v-if="$store.state.user.isAdmin" class="modal-li">Администрирование</li></router-link>
                    <router-link to="/settings"><li class="modal-li">Настройки</li></router-link>
                    <li class="modal-li" @click="logout">Выход</li>
                </ul>
            </div>
        </div>
    </header>
</template>

<script>
import Logo from './Logo.vue'
export default {
    components: {
        Logo,
    },

    data() {
        return {
            isList: false
        }
    },

    methods: {
        // Показать модальное окно
        showList() {
            this.isList = !this.isList
        },

        // Функция выхода с аккаунта
        logout() {
            this.$store.dispatch('logout')
            return location.replace('/')
        },
    },

    mounted() {
        this.$store.dispatch('checkAuth')
    },
}
</script>

<style scoped>
    .header {
        display: flex;
        justify-content: space-between;
        width: 80%;
        margin: 20px auto 0 auto;
    }

    .container {
        position: relative;
    }

    .pi-user {
        margin-right: 20px;
    }

    .pi-chevron-down {
        font-size: 10px;
    }

    .login {
        padding: 7px 20px;
        background-color: rgb(0, 139, 0);
        border-radius: 5px;
        margin-right: 10px;
        font-size: 14px;
        cursor: pointer;
    }

    .singin {
        background-color: inherit;
        margin: 0;
    }

    .user-block {
        display: flex;
        align-items: center;
        cursor: pointer;
        border-radius: 5px;
        padding: 10px 20px;
    }

    .reg-block {
        display: flex;
        vertical-align: center;
    }

    .user-name {
        margin: 0 15px 0 0;
    }

    .user-block:hover {
        background-color: rgb(50, 50, 50);
    }

    .modal {
        position: absolute;
        z-index: 1;
        width: 200px;
        right: 0;
        top: 110%;
        border-radius: 5px;
        background-color: rgb(45, 45, 45);
    }

    .modal-ul {
        list-style: none;
        margin: 0;
        padding: 10px 0;
    }

    .modal-li {
        padding: 8px 20px 8px 20px;
        cursor: pointer;
        user-select: none;
    }

    .modal-li:hover {
        background-color: rgb(42, 42, 42);
    }

    @media (max-width: 550px) {
        .user-name {
            display: none;
        }

        .header {
            width: 90%
        }
    }
</style>