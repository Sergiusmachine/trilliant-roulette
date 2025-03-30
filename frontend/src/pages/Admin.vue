<template>
    <div>
        <Header />
        <div class="container">
            <div class="title-block">
                <h1>Администрирование</h1>
                <router-link to="/logs" class="logs">Логи действий администрации</router-link>
            </div>
            

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

            <div class="menu">
                <h3 class="title-menu">Меню взаимодействия с игроком</h3>
                <form class="form-menu">
                    <input type="text" class="input-menu" placeholder="Введите никнейм" v-model="form.username" :maxLength="30" @input="(validateUsername(), filteredUsers())">
                    <ul class="users-list">
                        <li class="user" v-for="user of usersFiltered" @click="form.username = user.username, usersFiltered = []">{{ user.username }}</li>
                    </ul>
                    <select class="input-menu" v-model="form.option" name="" id="">
                        <option disabled selected hidden>Выберите действие</option>
                        <option>Выдать рулетки</option>
                        <option>Увеличить дневной лимит</option>
                        <option>Забрать рулетки</option>
                        <option>Информация</option>
                        <option>Зарегистрировать</option>
                        <option>Изменить ник</option>
                        <option>Сбросить пароль</option>
                    </select>
                    <p v-if="showRouletteField" style="font-size: 14px; margin: 0 0 5px 0; padding: 0; color: brown;">Укажите количество, которое хотите добавить или забрать</p>
                    <input v-if="showRouletteField" type="number" class="input-menu" @input="validateQuantity" :min="1" v-model="form.quantity" placeholder="Количество рулеток">
                    <input v-if="form.option === 'Зарегистрировать'" type="number" class="input-menu" v-model="form.accNumber" placeholder="Номер аккаунта в игре">
                    <input v-if="form.option === 'Зарегистрировать'" v-model="form.password" type="text" class="input-menu" placeholder="Временный пароль">
                    <input v-if="form.option === 'Изменить ник'" v-model="form.newName" type="text" class="input-menu" placeholder="Новый никнейм">
                    <div v-if="showInfo" style="margin-bottom: 20px;">
                        <h3>Информация о пользователе {{ user.username }}:</h3>
                        <p>Номер аккаунта в игре: <span>{{ user.accNumber }}</span></p>
                        <p>Права администратора: <span :style="{color: user.admin === 'Нет' ? 'brown' : 'green'}">{{ user.admin }}</span></p>
                        <p>Количство рулеток: <span :style="{color: user.quantity > 0 ? 'green' : 'brown'}">{{ user.quantity }}</span></p>
                        <p>Дневной лимит на прокрутки: <span :style="{color: user.todayQuantity > 0 ? 'green' : 'brown'}">{{ user.todayQuantity }}</span></p>
                        <router-link :to="{path: '/admLogsPrizes', query: { username: form.username }}" style="text-decoration: underline;">История выигрышей</router-link>
                    </div>
                    <button v-if="form.option !== 'Выберите действие'" class="add-roulette-btn" type="button" @click="selectAction">Готово</button>
                    <p v-if="succesMessage !== ''" class="succes-message">{{ succesMessage }}</p>
                    <p v-if="errorMessage !== ''" class="error-message">{{ errorMessage }}</p>
                </form>
            </div>

            <router-link to="/prizesList"><h3 class="title">Изменение списка призов</h3></router-link>
        </div>
    </div>
</template>

<script>
import Header from '../components/Header.vue'
export default {
    components: {
        Header,
    },

    computed: {
        // Показать поля для изменения количества рулеток
        showRouletteField() {
            return (
                this.form.option === 'Выдать рулетки' ||
                this.form.option === 'Забрать рулетки' ||
                this.form.option === 'Увеличить дневной лимит'
            );
        },
    },

    data() {
        return {
            // Форма с начислением рулеток
            form: {
                username: '',
                option: 'Выберите действие',
                quantity: 1,
                password: '',
                accNumber: null,
                newName: '',
            },

            user: { username: '', }, // Информация о конкретном пользователе
            users: [], // Список всех пользователей
            usersFiltered: [], // Отфильтрованный cписок всех пользователей
            userPrizes: [], // Массив всех призов всех пользователей
            showInfo: false, // Показать/скрыть информацию о пользователе            
            isPrizes: false, // Флаг окна призов
            openUser: null, // Для хранения текущего открытого пользователя
            groupedUserPrizes: {}, // Сгруппированные призы по пользователям
            checkedItems: [], // Состояние чекбоксов для каждого пользователя и приза
            succesMessage: '', // Сообщение об успешном выполнении действия
            errorMessage: '', // Сообщение об ошибке при выполнении действия
        }
    },

    async mounted() {
        await this.getUserPrizes();
        await this.getUsers();
    },

    methods: {
        // Удаление призов
        async deletePrize(username) {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/deletePrize', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        admin: this.$store.state.user.name,
                        action: 'Выдача приза',
                        username,
                        checkedItems: this.checkedItems
                    })
                })
                location.reload(true);
            } catch(error) {
                console.error('Ошибка при выполнении removePrizes():', error);
            }
        },

        // Получаем список всех зарегистрированных пользователей
        async getUsers() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/getUsers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (res.ok) {
                    this.users = await res.json();
                } else {
                    console.error('Ошибка при получении данных:', res.statusText);
                }
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
            }
        },

        // Получаем информацию о конкретном пользователе
        async getUserInfo() {
            if(this.form.username.length === 0) {
                this.errorMessage = 'Поля не должны быть пустыми!'
            } else {
                try {
                    const res = await fetch('https://trilliantroulette.ru/api/getInfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.form)
                    })
                    if (res.ok) {
                        const data = await res.json();
                        this.user.username = data.username;
                        if(!data.admin) {
                            this.user.admin = 'Нет';
                        } else {
                            this.user.admin = 'Да';
                        }
                        
                        this.user.quantity = data.quantity;
                        this.user.todayQuantity = data.todayquantity;
                        this.user.accNumber = data.accnumber
                        this.showInfo = true
                    } else if (res.status === 404) {
                        this.errorMessage = `Пользователь ${this.form.username} не найден`
                    } else {
                        // Для других кодов состояния
                        const errorData = await res.json();
                        this.errorMessage = `Ошибка: ${errorData.error || 'Неизвестная ошибка'}`
                    }
                } catch(error) {
                    console.error('Ошибка при выполнении getUserInfo():', error);
                }
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

        // Изменить количество рулеток
        async submitQuantity() {
            if(this.form.quantity.length === 0 || this.form.username.length === 0) {
                this.errorMessage = 'Поля не должны быть пустыми!'
            } else if (this.form.username === this.$store.state.user.name) {
                this.errorMessage = 'Нельзя выдать рулетки самому себе!'
            } else {
                try {
                    const res = await fetch('https://trilliantroulette.ru/api/addQuantity', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            admin: this.$store.state.user.name,
                            action: this.form.option === 'Выдать рулетки'
                                ? 'Выдать рулетки'
                                : this.form.option === 'Увеличить дневной лимит'
                                ? 'Увеличить дневной лимит'
                                : this.form.option === 'Забрать рулетки'
                                ? 'Забрать рулетки'
                                : null,
                            form: this.form,
                        })
                    })
                    if(res.ok) {
                        if(this.form.option === 'Выдать рулетки') {
                            this.succesMessage = `Пользователю ${this.form.username} добавлено ${this.form.quantity} рулеток`
                        } else if(this.form.option === 'Увеличить дневной лимит') {
                            this.succesMessage = `Пользователю ${this.form.username} увеличен дневной лимит рулеток на ${this.form.quantity}`
                        } else if(this.form.option === 'Забрать рулетки') {
                            this.succesMessage = `У ${this.form.username} стало на ${this.form.quantity} рулеток меньше`
                        }
                    }
                    if(res.status === 404) {
                        this.errorMessage = `Пользователь ${this.form.username} не найден или введены некоректные значения`
                    }
                } catch(error) {
                    console.error('Ошибка при выполнении submitQuantity():', error);
                }

                this.form.username = ''
                this.form.quantity = 1
            }
        },

        // Сбросить пароль игроку
        async resetPassword() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/resetPassword', {
                    method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            admin: this.$store.state.user.name,
                            action: this.form.option,
                            username: this.form.username,
                        })
                })

                if (res.ok) {
                    this.succesMessage = `Пользователю ${this.form.username} установлен дефолтный пароль`
                } else if (res.status === 404) {
                    this.errorMessage = `Пользователь ${this.form.username} не найден`
                } else {
                    this.errorMessage = `${res.status} - ${await res.text()}`
                }
                
            } catch(error) {
                console.error('Ошибка при сбросе пароля', error);
            }
        },

        // Отправка формы взаимодействия с игроком
        selectAction() {
            this.succesMessage = ''
            this.errorMessage = ''
            this.showInfo = false
            if(this.form.option === 'Выдать рулетки'
                || this.form.option === 'Увеличить дневной лимит'
                || this.form.option === 'Забрать рулетки'
            ) {
                this.submitQuantity()
            }

            if(this.form.option === 'Изменить ник') {
                this.changeName()
            }

            if(this.form.option === 'Зарегистрировать') {
                this.submitUser()
            }

            if(this.form.option === 'Информация') {
                this.getUserInfo()
            }

            if(this.form.option === 'Сбросить пароль') {
                this.resetPassword()
            }
        },

        // Изменить ник пользователю
        async changeName() {
            const username = this.form.username
            const newUsername = this.form.newName

            if (username.trim().length === 0 || newUsername.trim().length === 0) {
                this.errorMessage = 'Поля текущего и нового ника не должны быть пустыми!';
                return;
            }

            const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
            if (!nameRegex.test(newUsername)) {
                this.errorMessage = 'Имя и Фамилия должны начинаться с заглавной буквы и быть разделены пробелом!';
                return;
            }

            if (newUsername.length < 4) {
                this.errorMessage = 'Новый ник должен быть длиннее 4 символов!';
                return;
            }

            try {
                const res = await fetch('https://trilliantroulette.ru/api/changeName', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin: this.$store.state.user.name,
                        action: 'Смена никнейма',
                        username: this.form.username,
                        newName: this.form.newName,
                    }),
                });

                if (res.ok) {
                    this.succesMessage = `Ник для ${username} успешно изменен на ${newUsername}`;
                } else if (res.status === 404) {
                    this.errorMessage = `Пользователь ${username} не найден`;
                } else {
                    const errorData = await res.json();
                    this.errorMessage = `Ошибка: ${errorData.message || 'Не удалось изменить ник'}`;
                }
            } catch (error) {
                console.error('Ошибка при выполнении changeName():', error);
            }
            this.form.username = '';
            this.form.newName = '';
        },

        // Зарегистрировать нового пользователя
        async submitUser() {
            if(!/^[A-Z]/g.test(this.form.username)
            || !/^[A-Z]/g.test(this.form.username[this.form.username.indexOf(' ') + 1])) {
                this.errorMessage = 'Имя и Фамилия должны начинаться с заглавной буквы!'
            } else if(this.form.username.length === 0
            || this.form.password.length < 4
            || this.form.password.length > 30
            || this.form.accNumber.length < 1) {
                this.errorMessage =  'Поля не должны быть пустыми! Пароль должен быть от 4 до 30 символов'
            } else if(!this.form.username.includes(' ')) {
                this.errorMessage =  'Некорректный никнейм'
            } else {
                try {
                const res = await fetch('https://trilliantroulette.ru/api/addUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin: this.$store.state.user.name,
                        action: 'Регистрация пользователя',
                        username: this.form.username,
                        password: this.form.password,
                        accNumber: this.form.accNumber
                    })
                })
                if(res.ok) {
                    this.succesMessage = `Пользователь ${this.form.username} успешно зарегистрирован`
                } else if(res.status === 409) {
                    this.errorMessage = 'Ошибка: Пользователь с таким ником уже существует'
                }
                } catch(error) {
                    console.error('Ошибка при выполнении submitUser():', error);
                }

                this.form.username = ''
                this.form.password = ''
                this.form.accNumber = null
            }
        },


        validateQuantity() {
            if (this.form.quantity < 1) {
                this.form.quantity = 1;
            }
        },

        validateUsername() {
            this.form.username = this.form.username.replace(/[^a-zA-Z ]/g, '');
        },

        // Активация списка юзеров при вводе никнейма для выдачи рулетки
        filteredUsers() {
            if(this.form.username !== '') {
                this.usersFiltered = this.users.filter((item) => {
                    return item.username.startsWith(this.form.username)
                })
            } else {
                this.usersFiltered = []
            }
        },

        // Суммируем quantity для одинаковых призов
        groupPrizesByUser() {
            this.groupedUserPrizes = this.userPrizes.reduce((acc, prize) => {
                if (!acc[prize.username]) {
                acc[prize.username] = {};
                }

                if (!acc[prize.username][prize.prize_name]) {
                acc[prize.username][prize.prize_name] = prize.quantity < 2 ? [] : { quantity: 0, id: null };
                }

                const prizeQuantity = Number(prize.quantity);
                if (prizeQuantity < 2) {
                // Убедимся, что структура — массив
                if (!Array.isArray(acc[prize.username][prize.prize_name])) {
                    acc[prize.username][prize.prize_name] = [];
                }
                acc[prize.username][prize.prize_name].push({
                    quantity: prizeQuantity,
                    id: prize.id
                });
                } else {
                // Убедимся, что структура — объект
                if (Array.isArray(acc[prize.username][prize.prize_name])) {
                    acc[prize.username][prize.prize_name] = { quantity: 0, id: null };
                }
                acc[prize.username][prize.prize_name].quantity += prizeQuantity;
                acc[prize.username][prize.prize_name].id = prize.id;
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
            let existing = this.checkedItems.find(item => item.id === prize.id);
            if (existing) {
                existing.state = !existing.state;
            } else {
                this.checkedItems.push({
                    id: prize.id,
                    prizeName: prize.prize_name,
                    quantity: prize.quantity,
                    state: true,
                });
            }
        },

        // Проверяем, открыт ли пользователь
        isUserOpen(username) {
            return this.openUser === username;
        },

        // Открыть 
        openWindow(windowType) {
            if (windowType === 'isPrizes') {
                this.isPrizes = !this.isPrizes;
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

    .title-block {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 50px;
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

    .menu {
        height: max-content;
        width: 50%;
        background-color: #232323;
        border-radius: 5px;
        margin-top: 10px;
        margin-bottom: 30px;
        overflow-x: auto;
        padding: 0 30px 30px 30px;
    }

    .title-menu {
        margin-bottom: 30px;
    }

    .form-menu {
        display: flex;
        flex-direction: column;
        width: 100%;
    }

    .input-menu {
        display: block;
        margin-bottom: 20px;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background-color: #282828;
        color: #d3d3d3;
    }
    
    .input-menu:focus {
        outline: none;
    }

    .succes-message {
        color: #1b9d1b;
        font-size: 15px;
        margin-bottom: 0;
    }

    .error-message {
        color: brown;
        font-size: 15px;
        margin-bottom: 0;
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
        height: max-content;
        max-height: 300px;
    }

    .add-roulette-btn {
        width: max-content;
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

    .users-list {
        position: absolute;
        width: max-content;
        border-end-end-radius: 5px;
        border-end-start-radius: 5px;
        z-index: 1;
        background-color: #1d1d1d;
        margin-top: 36px;
        max-height: 120px;
        height: max-content;
        overflow: auto;
    }

    .user {
        padding: 10px 20px;
        cursor: pointer;
    }

    .user:hover {
        background-color: #1f1f1f;
    }

    .logs {
        font-size: 14px;
        font-weight: normal;
        background-color: #232323;
        border-radius: 5px;
        height: max-content;
        padding: 10px 20px;
    }

    .logs:hover {
        background-color: #202020;
    }

    @media(max-width: 900px) {
        .title-block {
            display: block;
        }

        .title-block a {
            display: block;
            width: max-content;
            text-align: center;
            margin: 30px auto;
        }

        h1 {
            text-align: center;
        }

        .title {
            width: 100%;
            box-sizing: border-box;
        }

        .open-window, .menu{
            width: 100%;
            box-sizing: border-box;
        }
    }

    @media(max-width: 430px) {


        h1 {
            font-size: 26px;
            display: block;
        }

        h1 a {
            display: block;
        }

        .title {
            width: 100%;
            box-sizing: border-box;
        }
    }
</style>