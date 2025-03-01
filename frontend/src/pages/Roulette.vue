<template>
    <Header />
    <div class="parent">
        <div class="container">
            <h4 v-if="$store.state.user.authorization" class="roulette-quantity">Количество рулеток: 
                <span :style="{color: $store.state.user.quantity === 0 ? 'red' : 'green'}">
                    {{ $store.state.user.quantity }}
                </span>
            </h4>
            
            <div class="scopeHidden">
                <img class="pi-caret-down" src="/assets/logo.svg" alt="" ref="caret">
                <ul :class="{'moveRoulette': isActive}" class="list" ref="rouletteList">
                    <li v-for="prize of fakePrizes" class='element' :style="{backgroundColor: prize.color}"><img class="img-element" :src="prize.url" alt=""></li>
                </ul>
            </div>
            <div class="prize-window-bg" v-if="!isHidden">
                <div class="prize-window">
                    <h3 class="title-prize-window">Поздравляю! Ты выиграл</h3>
                    <img class="img-prize" :src="finalResult.url" alt="">
                    <p class="name-prize">{{ changePrizeName(finalResult) }}</p>
                    <div class="buttons">
                        <button class="get-prize-btn" v-if="!onlySell" @click="closeWindow">Получить</button>
                        <button class="sell-prize-btn" v-if="onlyGet" @click="sellPrize">{{ finalResult.alternative ? `Продать за ${finalResult.quantity ? finalResult.alternative * finalResult.quantity : finalResult.alternative}$` : 'Получить' }}</button>
                    </div>
                </div>
            </div>
            <div v-if="$store.state.user.authorization">
                <h4 :style="{opacity: $store.state.user.todayQuantity === 0 ? 0.3 : 1}" class="today-quantity">Доступно сегодня: 
                    <span :style="{color: $store.state.user.todayQuantity === 0 ? 'red' : 'green'}">
                        {{ $store.state.user.todayQuantity }}
                    </span>
                </h4>
                <p v-if="$store.state.user.todayQuantity < 1">Будет доступно через {{ timeLeft.hours }}:{{ timeLeft.minutes }}:{{ timeLeft.seconds }}</p>
                
                <div v-if="!isButtonDisabled && !$store.state.user.quantity < 1 && !$store.state.user.todayQuantity < 1 && !isBanned">
                    <button class="start" @click="getFinalResult" >START</button>
                    <button class="fast-start" @click="getFastResult">Быстрая прокрутка</button>
                </div>

                <h3 class="technical-work" v-if="isBanned">{{ reasonForBan }}</h3>
            </div>
        

        
            <div style="margin-top: 50px;" v-if="!$store.state.user.authorization">
                <p>Чтобы крутить рулетку необходимо</p>
                <router-link to="/login" class="login">Авторизоваться</router-link>
            </div>
        </div>
    </div>
</template>

<script>
import Header from '../components/Header.vue'
import caseScrollSound from '../sounds/case_scroll.wav'

export default {
    components: {
        Header,
    },

    data() {
        return {
            prizes: [
                // {name: "Бриллианты", url: '/assets/prizes/brill.png', bg: 'gray', minQuantity: 10, maxQuantity: 150, alternative: 1200, chance: 20},
                // {name: "Сертификаты", url: '/assets/prizes/sert.png', bg: 'gray', minQuantity: 50, maxQuantity: 500, alternative: 1200, chance: 20},
                // {name: "Maverick", url: '/assets/prizes/maver.png', bg: 'gold', quantity: 1, alternative: 8000000, chance: 2},
                // {name: "Аксессуар + покраска", url: '/assets/prizes/acs.png', bg: 'gold', quantity: 1, alternative: 5000000, chance: 1},
                // {name: "Даймонд Боксы", url: '/assets/prizes/box.png', bg: 'gray', minQuantity: 2, maxQuantity: 30, chance: 20},
                // {name: "Скин Andre/Клоуна", url: '/assets/prizes/skin.png', bg: 'gray', quantity: 1, alternative: 80000, chance: 13},
                // {name: "Respin", url: '/assets/prizes/respin.png', bg: 'gray', chance: 7},
                // {name: "Игровая валюта", url: '/assets/prizes/virt.png', bg: 'blue', minQuantity: 150000, maxQuantity: 1500000, chance: 6},
                // {name: "Hotknife Hell", bg: 'blue', url: '/assets/prizes/hotknife.webp', quantity: 1, alternative: 500000, chance: 5},
                // {name: "Normal Ped (ID: 44)", bg: 'blue', url: '/assets/prizes/normalped.webp', quantity: 1, alternative: 300000, chance: 3},
                // {name: "Донат", url: '/assets/prizes/donate.png', bg: 'blue', minQuantity: 25, maxQuantity: 300, chance: 3},
            ],

            // Таймер
            timeLeft: {
                hours: 0,
                minutes: 0,
                seconds: 0
            },

            // Логирование количество рулеток до и после прокрута
            quantityHistory: {
                before: null,
                after: null,
            },

            fakePrizes: [], // Данные для визуального наполнения рулетки
            result: "", // Случайные результаты для наполнения рулетки
            finalResult: '', // Финальный результат прокрутки
            isActive: false, // Флаг старта анимации рулетки
            isButtonDisabled: false, // Флаг блока кнопки
            isHidden: true, // Флаг для появления окна с выигранным призом
            randomNumber: null, // Случайное число сдвига рулетки
            moveSound: null, // Звук для сдвига рулетки
            onlyGet: false, // Флаг для призов, которые нельзя обменять на валюту
            onlySell: false, // Флаг для призов, которые можно только продать
            isBanned: false, // Проверка на блокировку прокруток
            reasonForBan: '', // Причина бана
        }
    },

    async mounted() {
        await this.$store.dispatch('checkAuth') // Проверяем авторизацию
        await this.getPrizes() // Получаем список всех призов
        await this.$store.dispatch('getQuantity') // Подгружаем количество круток
        await this.checkBan(); // Проверяем на блокировку прокрута рулеток

        this.$nextTick(() => {
            const rouletteElement = this.$refs.rouletteList;
            this.moveSound = new Audio(caseScrollSound);
            this.moveSound.volume = 0.1;
            this.arrayMix();

            if (rouletteElement) {
                rouletteElement.addEventListener('transitionend', this.onAnimationEnd);
            }
        });
        
        this.updateCountdown();
        setInterval(this.updateCountdown, 1000);
    },

    methods: {
        // Функция для получения случайного элемента массива prizes
        start() {
            const totalChance = this.prizes.reduce((sum, prize) => sum + prize.chance, 0);
            const randomChance = Math.floor(Math.random() * totalChance);
            let cumulativeChance = 0;

            for (const prize of this.prizes) {
                cumulativeChance += prize.chance;
                if (randomChance <= cumulativeChance) {
                    if (prize.min_quantity && prize.max_quantity) {
                        const quantity = Math.floor(Math.random() * (prize.max_quantity - prize.min_quantity + 1)) + prize.min_quantity;
                        prize.quantity = quantity;
                        this.result = prize;
                    } else {
                        this.result = prize;
                    }
                    break;
                }
            }
        },

        // Уменьшаем количество круток после старта рулетки
        async decreaseQuantity() {
            try {
                await this.$store.dispatch('decreaseQuantity')
            } catch(error) {
                throw error
            }
        },

        // Увеличение количества рулеток, когда выпал Respin
        async increaseQuantity() {
            this.$store.dispatch('increaseQuantity')
        },

        // Добавляем в массив fakePrizes случайные элементы из массива prizes
        arrayMix() {
            while (this.fakePrizes.length < 100) {
                this.start();
                this.fakePrizes.push(this.result);
            }
        },

        // Крутим рулетку и получаем финальный результат
        async getFinalResult() {
            this.start();
            this.isButtonDisabled = true;
            this.finalResult = this.result;
            this.fakePrizes[96] = this.result;
            if(this.finalResult.name !== 'Respin') {
                try {
                    this.quantityHistory.before = this.$store.state.user.quantity
                    await this.decreaseQuantity();
                    this.quantityHistory.after = this.$store.state.user.quantity
                    await this.getPrize();
                } catch {
                    alert('Недостаточно рулеток')
                    location.reload(true)
                }
            } else if(this.finalResult.name === 'Respin') {
                this.$store.commit('SET_QUANTITY', this.$store.state.user.quantity - 1)
            };
            this.isActive = true;
            this.playSoundOnElementChange();
            if(this.finalResult.alternative) {
                this.onlyGet = true
            };
            this.getRandomNumber();
            this.updateRandomNumber();
        },

        // Получаем быстрый результат
        async getFastResult() {
            this.start();
            this.isButtonDisabled = true;
            this.finalResult = this.result;
            if(this.finalResult.name !== 'Respin') {
                try {
                    this.quantityHistory.before = this.$store.state.user.quantity
                    await this.decreaseQuantity();
                    this.quantityHistory.after = this.$store.state.user.quantity
                    await this.getPrize();
                } catch {
                    alert('Недостаточно рулеток')
                    location.reload(true)
                }
            };
            this.isHidden = false
            if(this.finalResult.alternative) {
                this.onlyGet = true
            }
        },

        // Закрыть окно с выигранным призом
        closeWindow() {
            this.isHidden = true;
            this.isButtonDisabled = false
            location.reload(true)
        },

        // Получаем список всех призов
        async getPrizes() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/getPrizes', {
                    method: 'GET',
                })
                if (!res.ok) {
                    throw new Error('Ошибка при получении данных с сервера');
                }
                this.prizes = await res.json()
            } catch (error) {
                console.error('Ошибка при выполнении getPrizes():', error);
            }
        },


        // Отправка приза в базу данных
        async getPrize() {
            if(this.finalResult.name !== 'Respin') {
                try {
                    const res = await fetch('https://trilliantroulette.ru/api/getPrize', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: this.$store.state.user.name,
                            prizeName: this.finalResult.name,
                            quantity: this.finalResult.quantity !== undefined ? this.finalResult.quantity : null,
                            userQuantityBefore: this.quantityHistory.before,
                            userQuantityAfter: this.quantityHistory.after,
                        })
                    })
                    if (!res.ok) {
                        const errorMessage = await res.text();
                        console.error('Ошибка:', errorMessage);
                    }
                } catch (error) {
                    console.error('Ошибка при выполнении sendPrizes():', error);
                }
            }
        },

        // Отправка КОМПЕНСАЦИИ за приз в базу данных
        async sellPrize() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/sellPrize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: this.$store.state.user.name,
                        prizeName: this.finalResult.name,
                        quantity: this.finalResult.quantity !== undefined ? this.finalResult.quantity : null,
                        alternative: this.finalResult.alternative !== undefined ? this.finalResult.quantity * this.finalResult.alternative : null,
                    })
                })
                if (!res.ok) {
                    const errorMessage = await res.text();
                    console.error('Ошибка:', errorMessage);
                }
            } catch (error) {
                console.error('Ошибка при выполнении sellPrizes():', error);
            }
            this.closeWindow()
        },

        // Получаем рандомное значение для класса moveRoulette
        getRandomNumber() {
            const min = -15113;
            const max = -14958;
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        // Обновляем значение для класса moveRoulette
        updateRandomNumber() {
            this.randomNumber = this.getRandomNumber();
            document.documentElement.style.setProperty('--random-number', this.randomNumber);
        },

        // Метод для проигрывания звука при каждом новом элементе
        playSoundOnElementChange() {
            const caret = this.$refs.caret;
            const list = this.$refs.rouletteList;
            let lastActiveIndex = null;

            const checkActiveElement = () => {
                const rectCaret = caret.getBoundingClientRect();
                const elements = list.children;

                for (let i = 0; i < elements.length; i++) {
                    const rectElement = elements[i].getBoundingClientRect();

                    // Проверяем, находится ли элемент под указателем caret
                    if (
                        rectElement.left < rectCaret.right &&
                        rectElement.right > rectCaret.left
                    ) {
                        // Если элемент изменился
                        if (i !== lastActiveIndex) {
                            // Останавливаем предыдущий звук
                            if (this.moveSound) {
                                this.moveSound.pause();
                                this.moveSound.currentTime = 0;
                            }
                            // Проигрываем звук для текущего элемента
                            this.moveSound.play().catch(error => {
                                console.error('Ошибка при воспроизведении звука:', error);
                            });
                            
                            // Запоминаем текущий активный элемент
                            lastActiveIndex = i;
                        }
                        break;
                    }
                }
                requestAnimationFrame(checkActiveElement);
            };
            requestAnimationFrame(checkActiveElement);
        },

        // Таймер обратного отсчета
        updateCountdown() {
            const now = new Date();
            const targetTime = new Date();
            targetTime.setHours(24, 0, 0, 0);
            const timeLeft = targetTime - now;
            this.timeLeft.hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            this.timeLeft.minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            this.timeLeft.seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            if (this.timeLeft.hours <= 0 && this.timeLeft.minutes <= 0 && this.timeLeft.seconds <= 0) {
                this.timeLeft.hours = 0;
                this.timeLeft.minutes = 0;
                this.timeLeft.seconds = 0;
                location.reload(true)
            }
        },

        async getQuantity() {
            try {
                return await this.$store.dispatch('getQuantity'); // Вызываем действие Vuex
            } catch (error) {
                alert(error.message); // Обрабатываем ошибку
            }
        },

        onAnimationEnd() {
            this.isHidden = false;
            if(this.finalResult.name === 'Respin') {
                return this.increaseQuantity()
            }
        },

        // Проверка на бан
        async checkBan() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/checkBan', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: this.$store.state.user.name }),
                });
                if(res.ok) {
                    this.isBanned = true;
                    const data = await res.json()
                    this.reasonForBan = data.reason
                }
                
            } catch (error) {
                console.error('Ошибка при проверке на блокировку', error);
            }
        },

        // Выбрать имя приза
        changePrizeName(item) {
            if(item.quantity && item.quantity != 1) {
                return `${item.name}(${item.quantity})`
            } else {
                return item.name
            }
        },
    },
}
</script>

<style scoped>
    .parent {
        display: flex;
        align-items: center;
        justify-content: center;
        height: calc(100vh - 59.33px);
    }
    .container {
        width: 80%;
        text-align: center;
        padding: 30px 0;
    }

    .scopeHidden {
        position: relative;
        overflow: hidden;
        width: 800px;
        border: 1px solid rgb(84, 84, 84);
        margin: 0 auto;
        height: 150px;
        border-radius: 5px;
    }

    .pi-caret-down {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        top: -2%;
        width: 20px;
        height: 20px;
        z-index: 1;
    }

    .list {
        position: relative;
        z-index: 0;
        display: inline-flex;
        list-style: none;
        margin: 0;
        padding: 0;
        transition: transform 20s cubic-bezier(0,0,0,1);
    }

    .element {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 150px;
        width: 160px;
        border-right: 1px solid rgb(84, 84, 84);
        box-sizing: border-box;
    }

    .roulette-quantity {
        font-weight: 500;
        margin-top: 0;
    }

    .today-quantity {
        font-weight: 500;
    }

    .start {
        margin-top: 10px;
        font-size: 15px;
        padding: 10px 30px;
        background-color: rgb(0, 139, 0);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: white;
    }

    .fast-start {
        background-color: inherit;
        border: none;
        margin-left: 30px;
        cursor: pointer;
        font-size: 15px;
        color: #d3d3d3;
    }

    .start:hover {
        background-color: rgb(0, 159, 0);
    }
    
    .login {
        display: inline-block;
        padding: 7px 20px;
        background-color: rgb(0, 139, 0);
        border-radius: 5px;
        margin-top: 8px;
        font-size: 18px;
        cursor: pointer;
    }
    
    .prize-window-bg {
        position: fixed;
        z-index: 2;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.5);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .prize-window {
        border: 1px solid black;
        width: 40%;
        border-radius: 5px;
        background-color: #252525;
        color: white;
        z-index: 3;
    }

    .title-prize-window {
        font-size: 30px;
        font-weight: 300;
    }

    .get-prize-btn {
        padding: 10px 20px;
        background-color: #5dd85d;
        font-size: 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin: 20px 0 30px auto;
    }

    .sell-prize-btn {
        padding: 10px 20px;
        background-color: #3c3c3c;
        color: white;
        font-size: 15px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        margin-left: 40px;
    }

    .sell-prize-btn:hover {
        background-color: #313131;
    }

    .get-prize-btn:hover {
        background-color: #6cd86c;
    }

    .img-prize {
        width: 150px;
        height: 150px;
    }

    .name-prize {
        font-size: 20px;
    }

    .img-element {
        width: 100px;
        height: 100px;
        opacity: 0.7;
    }

    .moveRoulette {
        transform: translateX(calc(var(--random-number) * 1px));
    }

    .technical-work {
        color: rgb(217 48 48);
    }

    @media(max-width: 440px) {
        .buttons {
            display: flex;
            flex-direction: column;
            gap: 15px;
            align-items: center;
        }
        .sell-prize-btn {
            margin-left: 0;
            width: auto;
            margin-bottom: 30px;
        }
        .get-prize-btn {
            width: auto;
            margin-bottom: 0;
            margin-left: 0;
        }
    }

    @media(max-width: 650px) {
        .container {
            width: 100%;
        }
    }

    @media(max-width: 1000px) {
        .prize-window {
            width: 80%;
        }
        .scopeHidden {
            width: 640px;
        }
        .moveRoulette {
            transform: translateX(calc(var(--random-number) * 1px - 80px));
        }
    }

    @media(max-width: 800px) {
        .scopeHidden {
            width: 480px;
        }
        .moveRoulette {
            transform: translateX(calc(var(--random-number) * 1px - 160px));
        }
    }

    @media(max-width: 550px) {
        .scopeHidden {
            width: 320px;
        }
        .moveRoulette {
            transform: translateX(calc(var(--random-number) * 1px - 240px));
        }
    }

    @media(max-width: 340px) {
        .scopeHidden {
            width: 160px;
        }
        .moveRoulette {
            transform: translateX(calc(var(--random-number) * 1px - 320px));
        }
    }

</style>