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

            <h3 class="title" @click="openWindow('isInfo')">Получить информацию о пользователе <i class="pi pi-chevron-down"></i></h3>
            <div class="add-roulette window" :class="{ 'add-roulette-open': isInfo }">
                <form style="display: flex; flex-direction: column; width: 100%;">
                    <input type="text" class="input" :maxLength="30" @input="(validateUsername(), filteredUsers(formInfo))" v-model="formInfo.username" placeholder="Ник игрока">
                    <ul class="users-list">
                        <li class="user" v-for="user of usersInfoFiltered" @click="formInfo.username = user.username, usersInfoFiltered = []">{{ user.username }}</li>
                    </ul>
                    <div v-if="user.username.length > 0" style="margin-bottom: 20px;">
                        <h3>Информация о пользователе {{ user.username }}:</h3>
                        <p>Номер аккаунта в игре: <span>{{ user.accNumber }}</span></p>
                        <p>Права администратора: <span :style="{color: user.admin === 'Нет' ? 'brown' : 'green'}">{{ user.admin }}</span></p>
                        <p>Количство рулеток: <span :style="{color: user.quantity > 0 ? 'green' : 'brown'}">{{ user.quantity }}</span></p>
                        <p>Дневной лимит на прокрутки: <span :style="{color: user.todayQuantity > 0 ? 'green' : 'brown'}">{{ user.todayQuantity }}</span></p>
                    </div>
                    <button type="button" @click="getUserInfo" class="add-roulette-btn">Готово</button>
                </form>
            </div>

            <h3 class="title" @click="openWindow('isAddRoulette')">Изменить количество рулеток <i class="pi pi-chevron-down"></i></h3>
            <div class="add-roulette window" :class="{ 'add-roulette-open': isAddRoulette }">
                <form style="display: flex; flex-direction: column; width: 100%;">
                    <input type="text" class="input" :maxLength="30" @input="(validateUsername(), filteredUsers(form))" v-model="form.username" placeholder="Ник игрока">
                    <ul class="users-list">
                        <li class="user" v-for="user of usersFiltered" @click="form.username = user.username, usersFiltered = []">{{ user.username }}</li>
                    </ul>
                    <select class="add-roulette-select" v-model="form.option" name="" id="">
                        <option>Выдать рулетки</option>
                        <option>Увеличить дневной лимит</option>
                        <option>Забрать рулетки</option>
                    </select>
                    <p style="font-size: 14px; margin: 0 0 5px 0; padding: 0; color: brown;">Укажите количество, которое хотите добавить или забрать</p>
                    <input type="number" class="input" @input="validateQuantity" :min="1" v-model="form.quantity" placeholder="Количество рулеток">
                    <button type="button" @click="submitQuantity" class="add-roulette-btn">Готово</button>
                </form>
            </div>

            <h3 class="title" @click="openWindow('isChangeName')">Обновить ник для пользователя <i class="pi pi-chevron-down"></i></h3>
            <div class="add-roulette window" :class="{ 'add-roulette-open': isChangeName }">
                <form style="display: flex; flex-direction: column; width: 100%;">
                    <input type="text" class="input" :maxLength="30" @input="validateUsername(), filteredUsers(formChangeName)" v-model="formChangeName.username" placeholder="Кому хотите изменить ник?">
                    <ul class="users-list">
                        <li class="user" v-for="user of usersChangeNameFiltered" @click="formChangeName.username = user.username, usersChangeNameFiltered = []">{{ user.username }}</li>
                    </ul>
                    <p style="font-size: 13px; color: brown; margin: 0 0 10px 0;">Внимание! Имя пользователя должно соответствовать игровому никнейму и быть в формате 'Имя Фамилия'</p>
                    <input type="text" class="input" :maxLength="30" v-model="formChangeName.newUsername" placeholder="Новый ник">
                    <button type="button" @click="changeName" class="add-roulette-btn">Изменить</button>
                </form>
            </div>

            <h3 class="title" @click="openWindow('isReg')">Зарегистрировать пользователя <i class="pi pi-chevron-down"></i></h3>
            <div class="add-roulette window" :class="{ 'add-roulette-open': isReg }">
                <form style="display: flex; flex-direction: column; width: 100%;">
                    <input type="number" class="input" v-model="formReg.accNumber" placeholder="Номер аккаунта в игре">
                    <p style="font-size: 13px; color: brown; margin: 0 0 10px 0;">Внимание! Имя пользователя должно соответствовать игровому никнейму и быть в формате 'Имя Фамилия'</p>
                    <input type="text" class="input" :maxLength="30" @input="validateUsername" v-model="formReg.username" placeholder="Игровой ник нового пользователя">
                    <input type="text" class="input" :maxLength="30" v-model="formReg.password" placeholder="Временный пароль">
                    <button type="button" @click="submitUser" class="add-roulette-btn">Зарегистрировать</button>
                </form> 
            </div>
            
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
            // Форма для получения информации о пользователе
            formInfo: {
                username: '',
            },
            // Форма с начислением рулеток
            form: {
                username: '',
                quantity: 1,
                option: 'Выдать рулетки',
            },
            // Форма регистрации
            formReg: {
                username: '',
                password: '',
                accNumber: '',
            },
            // Форма изменения ника пользователю
            formChangeName: {
                username: '',
                newUsername: '',
            },

            user: { username: '', }, // Информация о конкретном пользователе
            users: [], // Список всех пользователей
            usersInfoFiltered: [], // Отфильтрованный cписок всех пользователей для окна с информацией
            usersFiltered: [], // Отфильтрованный cписок всех пользователей для окна изменения количества рулеток
            usersChangeNameFiltered: [], // Отфильтрованный cписок всех пользователей для окна изменения ника
            userPrizes: [], // Массив всех призов всех пользователей
            isPrizes: false, // Флаг окна призов
            isReg: false, // Флаг окна регистрации
            isInfo: false, // Флаг окна информации о пользователе
            isChangeName: false, // Флаг окна смены ника пользователю
            isAddRoulette: false, // Флаг для окна начисления рулетки
            openUser: null, // Для хранения текущего открытого пользователя
            groupedUserPrizes: {}, // Сгруппированные призы по пользователям
            checkedItems: [], // Состояние чекбоксов для каждого пользователя и приза
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
            if(this.formInfo.username.length === 0) {
                alert('Поля не должны быть пустыми!')
            } else {
                try {
                    const res = await fetch('https://trilliantroulette.ru/api/getInfo', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(this.formInfo)
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
                    } else if (res.status === 404) {
                        alert(`Пользователь ${this.formInfo.username} не найден`);
                    } else {
                        // Для других кодов состояния
                        const errorData = await res.json();
                        alert(`Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
                    }
                } catch(error) {
                    console.error('Ошибка при выполнении getUserInfo():', error);
                }
                this.formInfo.username = ''
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
                            alert(`Пользователю ${this.form.username} добавлено ${this.form.quantity} рулеток`)
                        } else if(this.form.option === 'Увеличить дневной лимит') {
                            alert(`Пользователю ${this.form.username} увеличен дневной лимит рулеток на ${this.form.quantity}`)
                        } else if(this.form.option === 'Забрать рулетки') {
                            alert(`У ${this.form.username} стало на ${this.form.quantity} рулеток меньше`)
                        }
                    }
                    if(res.status === 404) {
                        alert(`Пользователь ${this.form.username} не найден или введены некоректные значения`)
                    }
                } catch(error) {
                    console.error('Ошибка при выполнении submitQuantity():', error);
                }

                this.form.username = ''
                this.form.quantity = 1
            }
        },

        // Изменить ник пользователю
        async changeName() {
            const { username, newUsername } = this.formChangeName;

            if (username.trim().length === 0 || newUsername.trim().length === 0) {
                alert('Поля "Текущий ник" и "Новый ник" не должны быть пустыми!');
                return;
            }

            const nameRegex = /^[A-Z][a-z]+ [A-Z][a-z]+$/;
            if (!nameRegex.test(newUsername)) {
                alert('Имя и Фамилия должны начинаться с заглавной буквы и быть разделены пробелом!');
                return;
            }

            if (newUsername.length < 4) {
                alert('Новый ник должен быть длиннее 4 символов!');
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
                        form: this.formChangeName,
                    }),
                });

                if (res.ok) {
                    alert(`Ник для ${username} успешно изменен на ${newUsername}`);
                } else if (res.status === 404) {
                    alert(`Пользователь ${username} не найден`);
                } else {
                    const errorData = await res.json();
                    alert(`Ошибка: ${errorData.message || 'Не удалось изменить ник'}`);
                }
            } catch (error) {
                console.error('Ошибка при выполнении changeName():', error);
            }
            this.formChangeName.username = '';
            this.formChangeName.newUsername = '';
        },

        // Зарегистрировать нового пользователя
        async submitUser() {
            if(!/^[A-Z]/g.test(this.formReg.username)
            || !/^[A-Z]/g.test(this.formReg.username[this.formReg.username.indexOf(' ') + 1])) {
                alert('Имя и Фамилия должны начинаться с заглавной буквы!')
            } else if(this.formReg.username.length < 4
            || this.formReg.password.length < 4
            || this.formReg.password.length > 30
            || this.formReg.accNumber.length < 1) {
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
                    body: JSON.stringify({
                        admin: this.$store.state.user.name,
                        action: 'Регистрация пользователя',
                        form: this.formReg,
                    })
                })
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
                this.formReg.accNumber = null
            }
        },


        validateQuantity() {
            if (this.form.quantity < 1) {
                this.form.quantity = 1;
            }
        },

        validateUsername() {
            this.form.username = this.form.username.replace(/[^a-zA-Z ]/g, '');
            this.formReg.username = this.formReg.username.replace(/[^a-zA-Z ]/g, '');
            this.formInfo.username = this.formInfo.username.replace(/[^a-zA-Z ]/g, '');
        },

        // Активация списка юзеров при вводе никнейма для выдачи рулетки
        filteredUsers(form) {
            if(form === this.form) {
                if(form.username !== '') {
                    this.usersFiltered = this.users.filter((item) => {
                        return item.username.startsWith(form.username)
                    })
                } else {
                    this.usersFiltered = []
                }
            } else if(form === this.formChangeName) {
                if(form.username !== '') {
                    this.usersChangeNameFiltered = this.users.filter((item) => {
                        return item.username.startsWith(form.username)
                    })
                } else {
                    this.usersChangeNameFiltered = []
                }
            } else if(form === this.formInfo) {
                if(form.username !== '') {
                    this.usersInfoFiltered = this.users.filter((item) => {
                        return item.username.startsWith(form.username)
                    })
                } else {
                    this.usersInfoFiltered = []
                }
            }
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
            } else if (windowType === 'isReg') {
                this.isReg = !this.isReg;
            } else if (windowType === 'isAddRoulette') {
                this.isAddRoulette = !this.isAddRoulette;
            } else if(windowType === 'isInfo') {
                this.isInfo = !this.isInfo;
            } else if(windowType === 'isChangeName') {
                this.isChangeName = !this.isChangeName;
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

    .input, .add-roulette-select {
        display: block;
        margin-bottom: 20px;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background-color: #282828;
        color: #d3d3d3;
    }

    .add-roulette-option {
        font-size: 12px;
        width: max-content;
        padding: 0;
    }

    .input:focus, .add-roulette-select:focus {
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