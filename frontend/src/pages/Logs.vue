<template>
    <Header />
    <div>
        <div class="container">
            <div style="display: flex;">
                <input class="input" type="text" name="" id="" placeholder="В разработке" disabled>
                <button class="button" disabled><i class="pi pi-search"></i></button>
            </div>
            <ul class="ul">
                <li v-for="log in logs" :key="log.id">
                    <span class="date">[{{ dateCorrection(log.timestamp) }}]</span>
                    <span>Администратор </span>
                    <span class="adm-name"> {{ log.admin }} </span>
                    <span v-html="actionCorrection(log.action, log.username, log.quantity, log.prize_name, log.newname)"></span>
                </li>
            </ul>
        </div>
    </div>
</template>
<script>
import Header from '../components/Header.vue'
export default {
    components: {
        Header,
    },

    async mounted() {
        await this.getLogs()
        console.log(this.logs)
    },

    data() {
        return {
            logs: [], // Массив с логами
            logsFiltered: [], // Массив с отфильтрованными логами
        }
    },

    methods: {
        // Получаем список логов
        async getLogs() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/getLogs')
                if(res.ok) {
                    const data = await res.json()
                    this.logs = data
                }
            } catch(err) {
                console.error(err)
            }
        },

        // Улучшаем вид даты
        dateCorrection(dateStr) {
            const dateObj = new Date(dateStr)
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            const hours = String(dateObj.getHours()).padStart(2, '0');
            const minutes = String(dateObj.getMinutes()).padStart(2, '0');
            const seconds = String(dateObj.getSeconds()).padStart(2, '0');

            const formattedDate = `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`;
            return formattedDate
        },

        // Редактируем текст действия администратора
        actionCorrection(action, username, quantity, prizeName, newName) {
            if(action === 'Регистрация пользователя') {
                return ` зарегистрировал пользователя <span style="color: #5b9870">${username}</span>`
            } else if(action === 'Смена никнейма') {
                return ` изменил пользователю <span style="color: #5b9870">${username}</span> никнейм на ${newName}`
            } else if(action === 'Забрать рулетки') {
                return ` забрал у пользователя <span style="color: #5b9870">${username}</span> рулетки(${quantity})`
            } else if(action === 'Выдача приза') {
                return ` выдал пользователю <span style="color: #5b9870">${username}</span> приз ${prizeName}(${quantity})`
            } else if(action === 'Увеличить дневной лимит') {
                return ` добавил пользователю <span style="color: #5b9870">${username}</span> дневной лимит на прокруты(${quantity})`
            } else if(action === 'Выдать рулетки') {
                return ` добавил пользователю <span style="color: #5b9870">${username}</span> рулетки(${quantity})`
            }
        },

        // Поиск строки
        search() {

        }
    }
}
</script>
<style scoped>
    .container {
        width: 80%;
        min-height: 80vh;
        margin: 0 auto;
        margin-top: 50px;
        background-color: #1d1d1d;
        border-radius: 5px;
        padding: 50px 0 50px 0;
    }

    .ul {
        list-style: none;
        padding: 40px 50px;
    }

    li {
        margin-bottom: 10px;
        font-family: "Space Mono", monospace;
        font-weight: 400;
        font-style: normal;
        font-size: 15px;
    }

    .input {
        display: block;
        margin-bottom: 20px;
        width: 30%;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background-color: #232323;
        color: #d3d3d3;
        margin: 0 10px 0 50px;
    }

    .input:focus {
        outline: none;
    }

    .date {
        color: #555555;
        margin-right: 5px;
        font-family: "Exo 2", sans-serif;
        font-optical-sizing: auto;
        font-style: normal;
    }

    .adm-name {
        color: #5b9870;
    }

    .button {
        background-color: #cccccc;
        border: none;
        border-radius: 5px;
        padding: 7px 12px;
        cursor: pointer;
        transition: ease .2s all;
    }

    .button:hover {
        background-color: #bbbbbb;
    }

    @media(max-width: 600px) {
        .container {
            width: 95%;
        }

        .ul {
            list-style: none;
            padding: 40px 20px;
        }

        .input {
            margin: 0 10px 0 20px;
        }
    }
</style>