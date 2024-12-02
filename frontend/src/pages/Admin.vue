<template>
    <div>
        <Header />
        <div class="container">
            <h1 style="margin-bottom: 70px;">Администрирование</h1>
            <h3 class="title" @click="openWindow('isPrizes')">Игроки, ожидающие выдачу призов <i class="pi pi-chevron-down"></i></h3>
            <div class="window" :class="{ 'open-window': isPrizes }">
                <ul>
                    <li v-for="(prizes, username) in groupedUserPrizes" :key="username">
                        <h5 @click="toggleUserPrizes(username)" class="user-title">
                            {{ username }}
                            <i :class="{'pi pi-chevron-down pi-user': !isUserOpen(username), 'pi pi-chevron-up pi-user': isUserOpen(username)}"></i>
                        </h5>
                        <ul v-show="isUserOpen(username)">
                            <template v-for="(quantity, prizeName) in prizes" :key="prizeName">
                                <li v-if="Array.isArray(quantity)" 
                                    v-for="(subQuantity, index) in quantity" 
                                    :key="index" 
                                    class="prize" 
                                    @click.stop="toggleCheckbox({ username, prize_name: prizeName, quantity: subQuantity.quantity, id: subQuantity.id })">
                                    [{{ username }}]: {{ prizeName }} - {{ subQuantity.quantity }}
                                    <input 
                                        class="checkbox" 
                                        type="checkbox" 
                                        :id="'checkbox-' + subQuantity.id" 
                                        :checked="isChecked(subQuantity.id)">
                                </li>
                                <li v-else 
                                    class="prize" 
                                    @click.stop="toggleCheckbox({ username, prize_name: prizeName, quantity: quantity.quantity, id: quantity.id })">
                                    [{{ username }}]: {{ prizeName }} - {{ quantity.quantity }}
                                    <input 
                                        class="checkbox" 
                                        type="checkbox" 
                                        :id=" 'checkbox-' + quantity.id"
                                        :checked="isChecked(quantity.id)">
                                </li>
                            </template>
                            <button class="give-prize" @click="deletePrize(username)">Выдано</button>
                        </ul>
                    </li>
                </ul>
            </div>

            <h3 class="title" @click="openWindow('isAddRoulette')">Начислить рулетки <i class="pi pi-chevron-down"></i></h3>
            <div class="add-roulette window" :class="{ 'add-roulette-open': isAddRoulette }">
                <form class="">
                    <input type="text" class="input" :maxLength="30" @input="validateUsername" v-model="form.username" placeholder="Ник игрока">
                    <input type="number" class="input" @input="validateQuantity" :min="1" :max="10" v-model="form.quantity" placeholder="Количество рулеток">
                    <button type="button" @click="submitQuantity" class="add-roulette-btn">Начислить</button>
                </form>
            </div>

            <h3 class="title" @click="openWindow('isReg')">Зарегистрировать пользователя <i class="pi pi-chevron-down"></i></h3>
            <form class="window" :class="{ 'add-roulette-open': isReg }">
                <p style="font-size: 13px; color: brown; margin: 0 0 10px 0;">Внимание! Имя пользователя должно соответствовать игровому никнейму и быть в формате 'Имя Фамилия'</p>
                <input type="text" class="input" :maxLength="30" @input="validateUsername" v-model="formReg.username" placeholder="Игровой ник нового пользователя">
                <input type="text" class="input" :maxLength="30" v-model="formReg.password" placeholder="Временный пароль">
                <button type="button" @click="submitUser" class="add-roulette-btn">Зарегистрировать</button>
            </form> 
        </div>
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
            form: {
                username: '',
                quantity: 1,
            },
            formReg: {
                username: '',
                password: '',
            },
            userPrizes: [], // Массив всех призов всех пользователей
            isPrizes: false, // Флаг окна призов
            isReg: false, // Флаг окна регистрации
            isAddRoulette: false, // Флаг для окна начисления рулетки
            openUser: null, // Для хранения текущего открытого пользователя
            groupedUserPrizes: {}, // Сгруппированные призы по пользователям
            checkedItems: [], // Состояние чекбоксов для каждого пользователя и приза
        }
    },

    mounted() {
        this.getUserPrizes();
    },

    methods: {
        async deletePrize(username) {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/deletePrize', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        username,
                        checkedItems: this.checkedItems
                    })
                })
                location.reload(true);
            } catch(error) {
                console.error('Ошибка при выполнении removePrizes():', error);
            }
        },

        // Получаем список всех призов из базы данных
        async getUserPrizes() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/getUserPrizes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (res.ok) {
                    this.userPrizes = await res.json();
                    this.groupPrizesByUser();
                } else {
                    console.error('Ошибка при получении данных:', res.statusText);
                }
            } catch (error) {
                console.error('Ошибка при выполнении sendPrizes():', error);
            }
        },

        // Добавить количество рулеток от админа
        async submitQuantity() {
            if(this.form.quantity.length === 0 || this.form.username.length === 0) {
                alert('Поля не должны быть пустыми!')
            } else if (this.form.username === this.$store.state.user.name) {
                alert('Нельзя выдать рулетки самому себе!')
            } else {
                try {
                    const res = await fetch('https://trilliantroulette.ru/api/addQuantity', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.form)
                    })
                    if(res.ok) {
                        alert(`Пользователю ${this.form.username} добавлено ${this.form.quantity} рулеток`)
                    }
                    if(res.status === 404) {
                        alert(`Пользователь ${this.form.username} не найден`)
                    }
                } catch(error) {
                    console.error('Ошибка при выполнении submitQuantity():', error);
                }

                this.form.username = ''
                this.form.quantity = 1
            }
            
        },

        // Зарегистрировать нового пользователя
        async submitUser() {
            if(!/^[A-Z]/g.test(this.formReg.username)
            || !/^[A-Z]/g.test(this.formReg.username[this.formReg.username.indexOf(' ') + 1])) {
                alert('Имя и Фамилия должны начинаться с заглавной буквы!')
            } else if(this.formReg.username.length < 4
            || this.formReg.password.length < 4
            || this.formReg.password.length > 30) {
                alert('Поля не должны быть пустыми! Пароль должен быть от 4 до 30 символов')
            } else if(!this.formReg.username.includes(' ')) {
                alert('Некорректный никнейм')
            } else {
                try {
                const res = await fetch('https://trilliantroulette.ru/api/addUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(this.formReg)
                })
                console.log()
                if(res.ok) {
                    alert(`Пользователь ${this.formReg.username} успешно зарегистрирован`)
                } else if(res.status === 409) {
                    alert('Ошибка: Пользователь с таким ником уже существует')
                }
                } catch(error) {
                    console.error('Ошибка при выполнении submitUser():', error);
                }

                this.formReg.username = ''
                this.formReg.password = null
            }
        },


        validateQuantity() {
            if (this.form.quantity < 1) {
                this.form.quantity = 1;
            } else if (this.form.quantity > 10) {
                this.form.quantity = 10;
            }
        },

        validateUsername() {
            this.form.username = this.form.username.replace(/[^a-zA-Z ]/g, '');
            this.formReg.username = this.formReg.username.replace(/[^a-zA-Z ]/g, '');
        },

        // Суммируем quantity для одинаковых призов
        groupPrizesByUser() {
            this.groupedUserPrizes = this.userPrizes.reduce((acc, prize) => {
                if (!acc[prize.username]) {
                    acc[prize.username] = {};
                }
                const prizeQuantity = Number(prize.quantity);
                if (prizeQuantity < 2) {
                    if (!acc[prize.username][prize.prize_name]) {
                        acc[prize.username][prize.prize_name] = [];
                    }
                    acc[prize.username][prize.prize_name].push({
                        quantity: prizeQuantity,
                        id: prize.id
                    });
                } else {
                    if (!acc[prize.username][prize.prize_name]) {
                        acc[prize.username][prize.prize_name] = {
                            quantity: 0,
                            id: prize.id
                        };
                    }
                    acc[prize.username][prize.prize_name].quantity += prizeQuantity;
                }
                return acc;
            }, {});
        }, 

        // Переключаем открытый пользователь
        toggleUserPrizes(username) {
            this.openUser = this.openUser === username ? null : username;
        },

        // Переключаем состояние чекбокса
        toggleCheckbox(prize) {
            const existing = this.checkedItems.find(item => item.id === prize.id);
            if (existing) {
                existing = !existing.state;
            } else {
                this.checkedItems.push({
                    id: prize.id,
                    prizeName: prize.prize_name,
                    quantity: prize.quantity,
                    state: true,
                });
            }
            console.log(this.checkedItems)
        },

        // Проверяем, открыт ли пользователь
        isUserOpen(username) {
            return this.openUser === username;
        },

        // Открыть 
        openWindow(windowType) {
            if (windowType === 'isPrizes') {
                this.isPrizes = !this.isPrizes;
            } else if (windowType === 'isReg') {
                this.isReg = !this.isReg;
            } else if (windowType === 'isAddRoulette') {
                this.isAddRoulette = !this.isAddRoulette;
            }
        },

        // Проверяем, отмечен ли чекбокс по id
        isChecked(prizeId) {
            return this.checkedItems.some(item => item.id === prizeId && item.state === true);
        },
    }
}
</script>

<style scoped>
    .container {
        width: 80%;
        margin: 50px auto 0 auto;
        min-height: 100vh;
        max-height: max-content;
    }

    ul {
        list-style: none;
        margin: 0;
        padding: 0;
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

    .pi {
        font-size: 15px;
    }

    .pi-user {
        font-size: 10px;
        margin-left: 5px;
    }

    .user-title {
        font-size: 17px;
        margin: 18px auto;
        cursor: pointer;
    }

    .give-prize {
        margin: 15px 0 15px 0;
        border: none;
        border-radius: 5px;
        padding: 7px 15px;
        font-size: 13px;
        cursor: pointer;
        background-color: #d3d3d3;
        color: black;
        transition: ease .2s all;
    }

    .prize {
        cursor: pointer;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 12px;
        user-select: none;
    }

    .checkbox {
        width: 15px;
        height: 15px;
    }

    .window {
        height: 0;
        width: 50%;
        background-color: #232323;
        border-radius: 5px;
        margin-top: 10px;
        margin-bottom: 30px;
        overflow-y: auto;
        overflow-x: hidden;
    }

    .open-window {
        padding: 7px 30px;
        height: 300px;
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

    .input:focus {
        outline: none;
    }

    .add-roulette {
        height: 0;
        padding: 0;
    }

    .add-roulette-open {
        height: max-content;
        padding: 30px;
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

    .add-roulette-btn:hover {
        background-color: #b9b9b9;
    }

    @media(max-width: 900px) {
        h1 {
            text-align: center;
        }

        .title {
            width: 100%;
            box-sizing: border-box;
        }

        .open-window {
            width: 100%;
            box-sizing: border-box;
        }

        .add-roulette-open {
            width: 100%;
            box-sizing: border-box;
        }
    }

    @media(max-width: 430px) {
        h1 {
            font-size: 26px;
        }

        .title {
            width: 100%;
            box-sizing: border-box;
        }
    }
</style>