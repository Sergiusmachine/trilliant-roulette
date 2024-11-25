<template>
    <Header />
    <div class="parent">
        <div class="container">
            <div class="scopeHidden">
                <img class="pi-caret-down" src="/assets/logo.svg" alt="" ref="caret">
                <ul :class="{'moveRoulette': isActive}" class="list" ref="rouletteList">
                    <li v-for="prize of fakePrizes" :class="['element', getBackground(prize)]"><img class="img-element" :src="prize.url" alt=""></li>
                </ul>
            </div>
            <div class="prize-window-bg" v-if="!isHidden">
                <div class="prize-window">
                    <h3 class="title-prize-window">Поздравляю! Ты выиграл</h3>
                    <img class="img-prize" :src="finalResult.url" alt="">
                    <p class="name-prize">{{ finalResult.quantity ? `${finalResult.name}(${finalResult.quantity})` : finalResult.name }}</p>
                    <div class="buttons">
                        <button class="get-prize-btn" v-if="!onlySell" @click="getPrize">Получить</button>
                        <button class="sell-prize-btn" v-if="onlyGet" @click="sellPrize">{{ finalResult.alternative ? `Продать за ${finalResult.quantity ? finalResult.alternative * finalResult.quantity : finalResult.alternative}$` : 'Получить' }}</button>
                    </div>
                </div>
            </div>
            <div v-if="$store.state.user.authorization">
                <h4 class="roulette-quantity">Количество рулеток: 
                    <span :style="{color: $store.state.user.quantity === 0 ? 'red' : 'green'}">
                        {{ $store.state.user.quantity }}
                    </span>
                </h4>
                <div v-if="!isButtonDisabled && !$store.state.user.quantity < 1">
                    <button class="start" @click="getFinalResult" >START</button>
                    <button class="fast-start" @click="getFastResult">Быстрая прокрутка</button>
                </div>
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
                {name: "Бриллианты", url: '/assets/prizes/brill.png', bg: 'gray', minQuantity: 10, maxQuantity: 150, alternative: 1200, chance: 20},
                {name: "Сертификаты", url: '/assets/prizes/sert.png', bg: 'gray', minQuantity: 50, maxQuantity: 500, alternative: 1200, chance: 20},
                {name: "Maverick", url: '/assets/prizes/maver.png', bg: 'gold', quantity: 1, alternative: 8000000, chance: 2},
                {name: "Аксессуар + покраска", url: '/assets/prizes/acs.png', bg: 'gold', quantity: 1, alternative: 5000000, chance: 1},
                {name: "Даймонд Боксы", url: '/assets/prizes/box.png', bg: 'gray', minQuantity: 2, maxQuantity: 30, chance: 20},
                {name: "Скин Andre/Клоуна", url: '/assets/prizes/skin.png', bg: 'gray', quantity: 1, alternative: 80000, chance: 13},
                {name: "Respin", url: '/assets/prizes/respin.png', bg: 'gray', chance: 7},
                {name: "Игровая валюта", url: '/assets/prizes/virt.png', bg: 'blue', minQuantity: 150000, maxQuantity: 1500000, chance: 6},
                {name: "Двухнедельный автомобиль", bg: 'blue', url: '/assets/prizes/2weekcar.png', quantity: 1, alternative: 500000, chance: 5},
                {name: "Двухнедельный скин", bg: 'blue', url: '/assets/prizes/2weekskin.png', quantity: 1, alternative: 300000, chance: 3},
                {name: "Донат", url: '/assets/prizes/donate.png', bg: 'blue', minQuantity: 25, maxQuantity: 300, chance: 3},
            ],

            fakePrizes: [], // Данные для визуального наполнения рулетки
            result: "", // Случайные результаты для наполнения рулетки
            finalResult: '', // Финальный результат прокрутки
            isActive: false, // Флаг старта анимации рулетки
            isButtonDisabled: false, // Флаг блока кнопки
            isHidden: true, // Флаг для блокировки кнопки
            randomNumber: null, // Случайное число сдвига рулетки
            moveSound: null, // Звук для сдвига рулетки
            onlyGet: false, // Флаг для призов, которые нельзя обменять на валюту
            onlySell: false, // Флаг для призов, которые можно только продать
        }
    },

    mounted() {
        this.$store.dispatch('checkAuth') // Проверяем авторизацию
        this.$store.dispatch('getQuantity') // Подгружаем количество круток
        this.$nextTick(() => {
            const rouletteElement = this.$refs.rouletteList;
            this.moveSound = new Audio(caseScrollSound);
            this.moveSound.volume = 0.1;
            this.arrayMix();

            if (rouletteElement) {
                rouletteElement.addEventListener('transitionend', this.onAnimationEnd);
            }
        });
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
                    if (prize.minQuantity && prize.maxQuantity) {
                        const quantity = Math.floor(Math.random() * (prize.maxQuantity - prize.minQuantity + 1)) + prize.minQuantity;
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
                    await this.decreaseQuantity();
                } catch {
                    alert('Недостаточно рулеток')
                    location.reload(true)
                }
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
                    await this.decreaseQuantity();
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

        // Отправка приза в базу данных
        async getPrize() {
            this.isHidden = true;
            this.isButtonDisabled = false
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
                        })
                    })
                    if (!res.ok) {
                        const errorMessage = await res.text(); // Попробуйте получить текст ошибки
                        console.error('Ошибка:', errorMessage);
                    }
                } catch (error) {
                    console.error('Ошибка при выполнении sendPrizes():', error);
                }
            }
            location.reload(true);
        },

        // Отправка КОМПЕНСАЦИИ за приз в базу данных
        async sellPrize() {
            this.isHidden = true;
            try {
                const res = await fetch('https://trilliantroulette.ru/api/sellPrize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: this.$store.state.user.name,
                        prizeName: 'Игровая валюта',
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
            location.reload(true);
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

        // Получаем фон для элементов рулетки
        getBackground(prize) {
            if (prize.bg === 'blue') {
                return 'bg-blue';
            } else if (prize.bg === 'gray') {
                return 'bg-gray';
            } else if (prize.bg === 'gold') {
                return 'bg-gold';
            } else {
                return '';
            }
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

    .bg-gray {
        background-color: #1f1f1f;
    }

    .bg-blue {
        background-color: #22226c;
    }

    .bg-gold {
        background-color: #7a7720;
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