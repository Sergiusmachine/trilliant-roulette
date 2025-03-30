<template>
    <div>
        <Header />
        <div class='container'>
            <h1 class="title">Редактор призов</h1>
            <div class="add-prize" @click="openFormWindow" v-if="!isCreatePrizeWindow">
                <i class="pi pi-plus" style="margin-right: 20px;"></i>
                <p>Добавить новый приз</p>
            </div>

            <form class="new-prize" v-if="isCreatePrizeWindow">
                <h3 style="margin-bottom: 30px;">Создание приза</h3>

                <p style="margin: 0; font-size: 20px; color: brown;">*</p>
                <p class="warning" v-if="warnings.prizeName">Название приза не должно быть пустым</p>
                <input class="input" type="text" placeholder="Введите название приза" v-model="formCreatePrize.name">

                <p style="margin: 0; font-size: 20px; color: brown;">*</p>
                <p class="warning" v-if="warnings.prizeChance">Введите корректное значение вероятности выпадения приза</p>
                <input class="input" type="number" placeholder="Вероятность выпадения" v-model="formCreatePrize.chance">

                <p class="warning" style="color: #fff;">Если у приза нет min и max количества, то оставьте оба поля пустыми</p>
                <p class="warning" v-if="warnings.prizeQuantity">Минимальное количество недолжно превышать максимальное</p>
                <p class="warning" v-if="warnings.prizeQuantityNull">Оба поля должны быть или пустыми, или заполненными</p>
                <input class="input" type="number" placeholder="Минимальное количество"
                    v-model="formCreatePrize.minQuantity"
                    @input="formCreatePrize.minQuantity = $event.target.value === '' ? null : Number($event.target.value)"
                >
                <input class="input" type="number" placeholder="Максимальное количество"
                    v-model="formCreatePrize.maxQuantity"
                    @input="formCreatePrize.maxQuantity = $event.target.value === '' ? null : Number($event.target.value)"
                >

                <p class="warning" style="color: #fff;">Если компенсации нет, то оставьте поле пустым</p>
                <input class="input" type="number" placeholder="Укажите компенсацию за 1 единицу приза"
                    v-model="formCreatePrize.alternative" 
                    @input="formCreatePrize.alternative = $event.target.value === '' ? null : Number($event.target.value)"
                >

                <p style="margin: 0; font-size: 20px; color: brown;">*</p>
                <div style="padding: 15px 30px; border: 1px solid #494949; border-radius: 5px; display: flex; flex-direction: column;">
                    <p class="warning" v-if="warnings.prizeImage">Загрузите изображение</p>
                    <!-- <input style="padding: 20px 0 0 0;" type="file" accept="image/*" @change="addImage"> -->
                    <p style="margin-bottom: 10px;">Рекомендуемый размер картинки 300x300</p>
                    <p style="margin-top: 0;">Загрузите изображение на фотохостинг, рекомендуемый - Imgbb. После чего нажимайте по картинке ПКМ и "Копировать адрес изображения"</p>
                    <input class="input" type="text" v-model="formCreatePrize.imageUrl" placeholder="Прямая ссылка на изображение">
                    <ul class="view-roulette" v-if="formCreatePrize.imageUrl !== ''">
                        <li class="view-element" :style="{backgroundColor: formCreatePrize.backgroundColor}"><img class="view-img" :src="formCreatePrize.imageUrl" alt=""></li>
                    </ul>

                    <div style="display: flex; align-items: center; margin-top: 30px;">
                        <p style="margin: 0 15px 0 0;">Выберите цвет фона:</p>
                        <input class="background-color-input" type="color" v-model="formCreatePrize.backgroundColor">
                    </div>
                    <p v-if="backgroundsStorage.length > 0" style="font-size: 14px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">Недавние: 
                        <div v-for="background in backgroundsStorage" class="recent-backgrounds" :style="{backgroundColor: background}" @click="formCreatePrize.backgroundColor = background"></div>
                    </p>
                </div>

                <button class="create-prize-button" type="button" @click="createPrize">Добавить приз</button>
            </form>

            <div class="prizes">
                <div v-for="(prize, index) in prizes" class="prize">
                    <div style="display: flex; align-items: center; margin-bottom: 10px;">
                        <div class="view-element" style="min-width: 50px; width: 50px; height: 50px; border-radius: 5px;" :style="{backgroundColor: prize.color}">
                            <img :src="prize.url" alt="" style="width: 30px; height: 30px;">
                        </div>
                        <h3 style="margin-left: 20px;">{{ prize.name }}</h3>
                    </div>

                    <div style="font-size: 14px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;" v-if="prize.max_quantity !== null">
                            <p>Начисляется <span style="color: #8d8fff;">{{ prize.min_quantity }}</span> - <span style="color: #8d8fff;">{{ prize.max_quantity }}</span> шт.</p>
                        </div>
                        
                        <p style="margin-top: 0;">Шанс выпадения: <span style="color: #23c4ab;">{{ prize.chance }}%</span></p>
                        <p v-if="prize.alternative !== null">Цена продажи: <span style="color: green;">{{ prize.alternative }}$</span></p>
                    </div>

                    <button class="create-prize-button" v-if="prize.name !== 'Respin'" style="padding: 7px 15px; font-size: 14px; margin-top: 20px;" @click="confirmDelete(prize, index)">Удалить</button>

                    <div class="confirmation-window-bg" v-if="isConfirmationWindow">
                        <div class="confirmation-window">
                            <p style="text-align: center; font-size: 17px; margin-bottom: 25px;">Вы действительно хотите удалить приз {{ prizeToDelete.name }}?</p>
                            <div style="display: flex; justify-content: center; gap: 40px; margin: 10px 0;">
                                <button class="create-prize-button" @click="deletePrize(prize, index)" style="margin: 0; padding: 7px 15px; font-size: 14px;">Да</button>
                                <button class="create-prize-button" @click="isConfirmationWindow = false" style="margin: 0; padding: 7px 15px; font-size: 14px;">Нет</button>
                            </div>
                        </div>
                    </div>
                    
                </div>
            </div>
        </div>
        <Notification />
    </div>
</template>
<script>
import Header from '../components/Header.vue';
import Notification from '../components/Notification.vue';
export default {
    async mounted() {
        await this.getPrizeList()
    },

    components: {
        Header, Notification,
    },

    data() {
        return {
            prizes: [], // Список призов

            // Форма создания приза
            formCreatePrize: {
                name: '',
                chance: null,
                minQuantity: null,
                maxQuantity: null,
                alternative: null,
                backgroundColor: 'black',
                // image: null,
                // imagePreview: '',
                imageUrl: '',
            },

            // Запоминаем приз, который хотим удалить
            prizeToDelete: {
                name: '',
                url: '',
                index: null,
            },

            // Ошибки при создании приза
            warnings: {
                prizeName: false,
                prizeChance: false,
                prizeImage: false,
                prizeQuantity: false,
                prizeQuantityNull: false,
            },

            isCreatePrizeWindow: false, // Показать/скрыть форму добавления приза
            isConfirmationWindow: false, // Показать/скрыть окно подтверждения удаления приза
            backgroundsStorage: [], // Память используемых фонов при создании приза
            isNotification: false,
        }
    },

    methods: {
        // Развернуть форму для создания приза
        openFormWindow() {
            this.isCreatePrizeWindow = true
            if(localStorage.getItem('backgroundsStorage')) {
                this.backgroundsStorage = JSON.parse(localStorage.getItem('backgroundsStorage'))
            } else {
                this.backgroundsStorage = []
            }
        },

        // Кнопка создания приза
        async createPrize() {
            const isValid = this.validateForm()
            if (!isValid) return

            try {
                
                const res = await fetch('https://trilliantroulette.ru/api/createPrize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prizeName: this.formCreatePrize.name,
                        prizeUrl: this.formCreatePrize.imageUrl,
                        backgroundColor: this.formCreatePrize.backgroundColor,
                        minQuantity: this.formCreatePrize.minQuantity,
                        maxQuantity: this.formCreatePrize.maxQuantity,
                        alternative: this.formCreatePrize.alternative,
                        chance: this.formCreatePrize.chance,
                        admin: this.$store.state.user.name,
                        action: 'Создание приза'
                    })
                })

                if(res.ok) {
                    if (!this.backgroundsStorage.includes(this.formCreatePrize.backgroundColor)) {
                        this.backgroundsStorage.push(this.formCreatePrize.backgroundColor)
                    }
                    if(this.backgroundsStorage.length > 5) {
                        this.backgroundsStorage.shift()
                    }
                    localStorage.setItem('backgroundsStorage', JSON.stringify(this.backgroundsStorage))
                    location.reload(true)
                } else {
                    const errorMessage = await res.json()
                    this.$store.dispatch('notification', {message: errorMessage.message, condition: false, show: true})
                }
            } catch(error) {
                this.$store.dispatch('notification', {message: 'Ошибка при создании приза', condition: false, show: true})
            }
            
        },

        // Валидация формы создания приза
        validateForm() {
            let isValid = true

            this.warnings.prizeName = false;
            this.warnings.prizeChance = false;
            this.warnings.prizeImage = false;
            this.warnings.prizeQuantity = false;
            this.warnings.prizeQuantityNull = false;

            // Название приза
            if(this.formCreatePrize.name.length < 1) {
                this.warnings.prizeName = !this.warnings.prizeName
                isValid = false
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }

            // Шанс выпадения
            if(this.formCreatePrize.chance < 1) {
                this.warnings.prizeChance = true
                isValid = false
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }

            // Наличие картинки
            if(this.formCreatePrize.imageUrl === '') {
                this.warnings.prizeImage = true
                isValid = false
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }

            // Минимальное кол-во не должно быть больше максимального
            if(this.formCreatePrize.minQuantity !== null
                && this.formCreatePrize.maxQuantity !== null
                && this.formCreatePrize.minQuantity > this.formCreatePrize.maxQuantity
            ) {
                this.warnings.prizeQuantity = true
                isValid = false
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }

            // Не может быть заполнено только одно поле количества
            if((this.formCreatePrize.minQuantity === null) !== (this.formCreatePrize.maxQuantity === null)) {
                this.warnings.prizeQuantityNull = true
                isValid = false
                window.scrollTo({ top: 100, behavior: 'smooth' });
            }

            return isValid
        },

        // Кнопка удаления приза
        async deletePrize() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/destructionPrize', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        prizeName: this.prizeToDelete.name,
                        prizeUrl: this.prizeToDelete.url,
                        admin: this.$store.state.user.name,
                        action: 'Удаление приза',
                    })
                })

                if(res.ok) {
                    this.isConfirmationWindow = false
                    this.prizes.splice(this.prizeToDelete.index, 1)
                    this.$store.dispatch('notification', {message: `Приз ${this.prizeToDelete.name} был успешно удален`, condition: true, show: true})
                } else {
                    this.isConfirmationWindow = false
                    alert(`Произошла ошибка при удалении приза`)
                    this.$store.dispatch('notification', {message: `Произошла ошибка при удалении приза`, condition: false, show: true})
                }

            } catch(error) {
                console.error('Ошибка при попытке удалении приза: ' + error)
            }
        },

        // Запоминаем данные удаляемого приза для окна подтверждения удаления
        confirmDelete(prize, index) {
            this.isConfirmationWindow = true
            this.prizeToDelete.name = prize.name
            this.prizeToDelete.url = prize.url
            this.prizeToDelete.index = index
        },

        // Подргузка призов из базы данных
        async getPrizeList() {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/getAllPrizes')

                if(res.ok) {
                    this.prizes = await res.json()
                } else {
                    console.error('Ошибка получения списка призов')
                }
            } catch(error) {
                console.error(error)
            }
        },

        // Добавление и предпросмотр картинки
        // addImage(event) {
        //     this.formCreatePrize.image = event.target.files[0]
        //     const reader = new FileReader
        //     reader.onload = (e) => {
        //         this.formCreatePrize.imagePreview = e.target.result
        //     }
        //     reader.readAsDataURL(this.formCreatePrize.image)
        // },

        // Загрузка картинки
        // async uploadImage() {
        //     if(this.formCreatePrize.image === null) {
        //         this.warnings.prizeImage = true
        //         return
        //     }

        //     const formData = new FormData()
        //     formData.append("file", this.formCreatePrize.image)

        //     try {
        //         const response = await fetch("https://trilliantroulette.ru/api/upload", {
        //             method: "POST",
        //             body: formData,
        //         })

        //         const result = await response.json();

        //         if(response.ok) {
        //             this.formCreatePrize.imageUrl = result.imageUrl
        //         } else {
        //             alert(`Ошибка загрузки изображения`)
        //         }
        //     } catch(error) {
        //         alert('Произошла ошибка' + ' ' + error)
        //     }
        // },
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

    .add-prize {
        display: flex;
        align-items: center;
        margin-top: 50px;
        background-color: #232323c7;
        border-radius: 5px;
        padding: 0 30px;
        cursor: pointer;
        transition: ease .2s all;
        border: 1px solid #363636;
    }

    .add-prize:hover {
        background-color: #232323;
    }

    .new-prize {
        display: flex;
        flex-direction: column;
        background-color: #232323;
        border-radius: 5px;
        padding: 0 30px 30px 30px;
        margin-top: 30px;
    }

    .input {
        margin-bottom: 20px;
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        background-color: #282828;
        color: #d3d3d3;
    }

    .input:focus {
        outline: none;
    }

    .background-color-input {
        width: 50px;
        height: 50px;
        padding: 0;
        background-color: inherit;
        border: none;
        cursor: pointer;
    }

    .warning {
        margin-top: 0;
        font-size: 13px;
        color: brown;
    }

    .create-prize-button {
        border: none;
        border-radius: 5px;
        padding: 15px 15px;
        font-size: 13px;
        cursor: pointer;
        background-color: #d3d3d3;
        color: black;
        transition: ease .2s all;
        margin-top: 50px;
        font-size: 16px;
    }

    .create-prize-button:hover {
        background-color: #b7b7b7;
    }

    .create-prize-button:focus {
        outline: none;
    }

    .view-roulette {
        display: inline-flex;
        list-style: none;
        margin-top: 30px;
        padding: 0;
        border: 1px solid rgb(84, 84, 84);
        width: max-content;
    }

    .view-element {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 150px;
        width: 160px;
        box-sizing: border-box;
    }

    .view-img {
        width: 100px;
        height: 100px;
    }

    .prizes {
        display: flex;
        flex-wrap: wrap;
        margin-top: 30px;
        gap: 20px;
    }

    .prize {
        display: flex;
        flex-direction: column;
        width: calc(33.333% - 65px);
        min-width: 250px;
        background-color: #232323c7;
        border-radius: 5px;
        padding: 20px 25px;
        justify-content: space-between;
    }

    .confirmation-window-bg {
        position: fixed;
        z-index: 2;
        width: 100%;
        height: 100vh;
        background-color: rgba(0, 0, 0, 0.6);
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .confirmation-window {
        border: 1px solid black;
        width: 40%;
        border-radius: 5px;
        background-color: #252525;
        color: white;
        z-index: 3;
        padding: 10px 10px;
    }

    .recent-backgrounds {
        min-width: 20px; 
        width: 20px;
        height: 20px; 
        margin-right: 5px; 
        border-radius: 5px; 
        border: 1px solid #6d6d6d; 
        cursor: pointer;
    }

    @media(max-width: 1174px) {
        .prize {
            width: calc(50% - 60px);
        }
    }

    @media(max-width: 774px) {
        .prize {
            width: calc(100%);
        }

        .confirmation-window {
            width: 80%;
        }
    }

    @media(max-width: 450px) {
        .prize {
            width: calc(100%);
        }

        .add-prize {
            justify-content: center;
        }

        .container {
            width: 95%;
        }

        .title {
            font-size: 27px;
        }
    }
</style>