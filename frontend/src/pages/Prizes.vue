<template>
    <div>
        <Header />
        <div class="container">
            <h1 class="title">Призы ожидающие выдачи:</h1>
            <ul class="list">
                <li class="element" v-for="prize in prizes">
                   {{ prize.prize_name }} {{ prize.quantity ? '-' : '' }} {{ prize.quantity }}
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

    data() {
        return {
            prizes: []
        }
    },

    mounted() {
        this.getPrizeList()
        console.log(this.prizes)
    },

    methods: {
        // Возвращем список призов
        async getPrizeList() {
            const res = await fetch('https://trilliantroulette.ru/api/getPrizeList', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: this.$store.state.user.name
                })
            });

            if (res.ok) {
                const prizes = await res.json();
                const result = []; // Массив для хранения итоговых призов

                // Объект для хранения суммированных призов
                const prizeMap = {};

                // Проходим по всем призам
                prizes.forEach(prize => {
                    const quantity = prize.quantity ? parseInt(prize.quantity, 10) : null; // Преобразуем в число или оставляем null

                    // Если quantity есть, добавляем в prizeMap
                    if (quantity !== null) {
                        if (prizeMap[prize.prize_name]) {
                            prizeMap[prize.prize_name].quantity += quantity; // Суммируем quantity
                        } else {
                            prizeMap[prize.prize_name] = {
                                prize_name: prize.prize_name,
                                quantity: quantity
                            };
                        }
                    } else {
                        // Если quantity нет, добавляем приз в результат без изменений
                        result.push({
                            prize_name: prize.prize_name,
                            quantity: '' // Или можно указать, что quantity отсутствует
                        });
                    }
                });

                // Добавляем в результат призы с суммированным quantity
                for (const key in prizeMap) {
                    result.push(prizeMap[key]);
                }

                // Обновляем массив призов в компоненте
                this.prizes = result;
            } else {
                console.error("Ошибка сервера:", await res.text());
            }
        },   
    }
}
</script>
<style scoped>

    .container {
        width: 80%;
        margin: 50px auto 0 auto;
        height: 100vh;
    }

    .title {
        font-weight: 600;
    }

    .list {
        list-style: none;
        margin: 50px 0 0 0;
        padding: 0;
    }

    .element {
        margin: 20px 0;
        font-size: 18px;
    }

    @media(max-width: 400px) {
        .title {
            font-size: 25px;
        }
    }
</style>