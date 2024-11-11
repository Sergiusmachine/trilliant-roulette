<template>
    <Header />
    <div class="container">
        <h1 style="margin: 60px 0;">Настройки пользователя</h1>
        <h3 class="title" @click="openWindow('isPassword')">Смена пароля <i class="pi pi-chevron-down"></i></h3>
        <form class="windows" :class="{'open-window-change-password': isPassword}">
            <input class="input" type="text" :maxLength="16" v-model="password" placeholder="Введите новый пароль">
            <input class="input" type="text" :maxLength="16" v-model="repeatPassword" placeholder="Повторите новый пароль">
            <button class="add-roulette-btn" type="button" @click="updatePassword">Готово</button>
        </form>
    </div>
</template>
<script>
import Header from '../components/Header.vue'
export default {
    components: {
        Header,
    },

    data() {
        return {
            password: '',
            repeatPassword: '',
            isPassword: false,
            username: this.$store.state.user.name
        }
    },

    mounted() {

    },

    methods: {
        // Сменить пароль
        async updatePassword() {
            console.log(this.username, this.password)
            if(this.password === this.repeatPassword) {
                try {
                    const res = await fetch('http://localhost:3000/updatePassword', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: this.username,
                            password: this.password,
                        })
                    })

                    if(res.ok) {
                        alert('Пароль изменен') 
                    } else {
                        console.log(res.json())
                        alert('Ошибка выполнения смены пароля')
                    }
                } catch {
                    console.error('Ошибка выполнения смены пароля')
                }
            } else {
                alert('Ошибка: Пароли не совпадают')
            }

            this.password = ''
            this.repeatPassword = ''
        },

        // Анимация
        openWindow(windowType) {
            if (windowType === 'isPassword') {
                this.isPassword = !this.isPassword;
            }
        },
    }
}
</script>
<style scoped>
    .container {
        width: 80%;
        margin: 50px auto 0 auto;
    }
    .title {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 50%;
        padding: 17px 30px;
        background-color: #232323;
        border-radius: 5px;
        cursor: pointer;
        margin: 0;
    }

    .input {
        display: block;
        margin-bottom: 20px;
        width: 80%;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background-color: #282828;
        color: #d3d3d3;
    }

    .windows {
        height: 0;
        width: 50%;
        background-color: #232323;
        border-radius: 5px;
        margin-top: 10px;
        margin-bottom: 30px;
        overflow: hidden;
    }

    .open-window-change-password {
        padding: 30px;
        height: max-content;
    }

    .add-roulette-btn {
        border: none;
        border-radius: 5px;
        padding: 7px 15px;
        font-size: 13px;
        cursor: pointer;
        background-color: #d3d3d3;
        color: black;
        transition: ease .2s all;
    }

    @media(max-width: 900px) {
        h1 {
            text-align: center;
        }

        .title {
            width: 100%;
            box-sizing: border-box;
        }

        .windows {
            width: 100%;
            box-sizing: border-box;
        }
    }

    @media(max-width: 493px) {
        h1 {
            font-size: 26px;
        }

        .title {
            width: 100%;
            box-sizing: border-box;
        }
    }
</style>