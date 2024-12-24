<template>
    <Header />
    <div>
        <div class="container">
            <div class="input-cont" style="display: flex; margin-bottom: 40px;">
                <select name="" id="" v-model="activeDate" @change="setActiveDate" class="specific-date">
                    <option value="Все">Все</option>
                    <option v-for="date in uniqueDates" :key="date" :value="date">{{ dateOptionCorrection(date) }}</option>
                </select>
            </div>

            <ul class="ul" ref="toTop">
                <li v-for="log in logsFiltered" :key="log.id">
                    <span class="date">[{{ dateCorrection(log.timestamp) }}]</span>
                    <span>Администратор </span>
                    <span class="adm-name"> {{ log.admin }} </span>
                    <span v-html="actionCorrection(log.action, log.username, log.quantity, log.prize_name, log.newname)"></span>
                </li>
            </ul>
            <button v-if='(logsFiltered.length > 25)' class="scroll-top-button" @click="scrollTop">В начало <i class="pi pi-arrow-up"></i></button>
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
        this.logsFiltered = this.logs
    },

    data() {
        return {
            logs: [], // Массив с логами
            logsFiltered: [], // Массив с отфильтрованными логами
            uniqueDates: [], // Массив с уникальной датой(месяц, день)
            activeDate: 'Все', // Активация кнопки с датой
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

            if(!this.uniqueDates.includes(`${year}-${month}-${day}`)) {
                this.uniqueDates.push(`${year}-${month}-${day}`)
            }
            
            const formattedDate = `${year}-${month}-${day}, ${hours}:${minutes}:${seconds}`;
            return formattedDate
        },

        // Улучшаем вид даты в option
        dateOptionCorrection(date) {
            const dateObj = new Date(date);

            const months = [
            "января", "февраля", "марта", "апреля", "мая", "июня",
            "июля", "августа", "сентября", "октября", "ноября", "декабря"
            ];

            const day = dateObj.getDate();
            const month = months[dateObj.getMonth()];
            const formattedDate = `${day} ${month}`;
            return formattedDate;
        },

        // Редактируем текст действия администратора
        actionCorrection(action, username, quantity, prizeName, newName) {
            if(action === 'Регистрация пользователя') {
                return ` зарегистрировал пользователя <span style="color: #5b9870">${username}</span>`
            } else if(action === 'Смена никнейма') {
                return ` изменил пользователю <span style="color: #5b9870">${username}</span> никнейм на ${newName}`
            } else if(action === 'Забрать рулетки') {
                return ` забрал у пользователя <span style="color: #5b9870">${username}</span> рулетки(-${quantity})`
            } else if(action === 'Выдача приза') {
                return ` выдал пользователю <span style="color: #5b9870">${username}</span> приз ${prizeName}(${quantity})`
            } else if(action === 'Увеличить дневной лимит') {
                return ` добавил пользователю <span style="color: #5b9870">${username}</span> дневной лимит на прокруты(+${quantity})`
            } else if(action === 'Выдать рулетки') {
                return ` добавил пользователю <span style="color: #5b9870">${username}</span> рулетки(+${quantity})`
            }
        },

        // Кнопка для скролла в начало списка
        scrollTop() {
            this.$refs.toTop.scrollIntoView({
                block: 'start',
                behavior: 'smooth'
            })
        },

        setActiveDate() {
            if (this.activeDate !== "Все") {
                this.logsFiltered = this.logs.filter(item =>
                item.timestamp.includes(this.activeDate)
                );
            } else {
                this.logsFiltered = this.logs;
            }
        },
    }
}
</script>
<style scoped>
    .container {
        width: 80%;
        height: 80vh;
        margin: 0 auto;
        margin-top: 50px;
        background-color: #1d1d1d;
        border-radius: 5px;
        padding: 50px 0 50px 0;
        overflow: auto;
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

    .date-sort {
        width: 90%;
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        margin: 0 auto;
    }

    .specific-date {
        margin-left: 50px;
        background-color: #222222;
        padding: 12px 20px;
        border-radius: 5px;
        border: none;
        color: rgb(226, 226, 226);
        cursor: pointer;
        width: 30%;
    }

    .specific-date:focus {
        outline: none;
    }

    .scroll-top-button {
        display: block;
        background-color: #222222;
        width: 90%;
        padding: 30px 0;
        margin: 0 auto;
        border: none;
        cursor: pointer;
        color: rgb(226, 226, 226);
        font-size: 17px;
    }

    .pi-arrow-up {
        margin-left: 30px;
        font-size: 14px;
    }

    .scroll-top-button:hover {
        background-color: #252525;
    }

    .date-active {
        background-color: #d3d3d3;
        color: #232323;
    }

    @media(max-width: 1000px) {
        .specific-date {
            width: 50%;
        }
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
            width: 80%;
        }

        .input-cont {
            width: 90%;
        }

        .specific-date {
            margin-left: 20px;
            width: 70%;
        }
    }
</style>