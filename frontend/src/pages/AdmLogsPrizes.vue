<template>
    <div>
        <BaseLogs 
            :titleComponent="`История выигрышей ${this.$route.query.username}`"
            fetchUrl="https://trilliantroulette.ru/api/getUserLogsPrizes"
            :actionCorrection="actionCorrection"
            :fetchOptions="{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: this.$route.query.username })
            }"
        />
    </div>
</template>
<script>
import BaseLogs from '../components/BaseLogs.vue'
export default {
    components: {
        BaseLogs,
    },

    mounted() {
        console.log(this.$route.query.username)
    },

    methods: {
        actionCorrection(log) {
            const { 
                prize_name: prizeName, 
                prize_quantity: prizeQuantity,
                user_quantity_before: userQuantityBefore,
                user_quantity_after: userQuantityAfter,
                alternative
            } = log;

            if (alternative === null) {
                return `[${this.$route.query.username}]: <span style="font-family: 'Exo 2', sans-serif; word-spacing: 5px;">
                    <span style="color: #1b9d1b; font-size: 14px; font-family: 'Exo 2', sans-serif;">(${userQuantityBefore})</span>
                    <i class="pi pi-arrow-right" style="font-size: 10px;"></i>
                    <span style="color: #cd3636; font-size: 14px; font-family: 'Exo 2', sans-serif;">(<i class="pi pi-caret-down" style="font-size: 10px;"></i>${userQuantityAfter})</span> -
                    Получил приз <span style="color: #5b9870;">${prizeName}</span><span style="font-family: 'Exo 2', sans-serif;">(${prizeQuantity})</span>
                </span>
                `
            } else {
                return `[${this.$route.query.username}]: <span style="font-family: 'Exo 2', sans-serif; word-spacing: 5px;">
                    <span style="color: #1b9d1b; font-size: 14px; font-family: 'Exo 2', sans-serif;">(${userQuantityBefore})</span>
                    <i class="pi pi-arrow-right" style="font-size: 10px;"></i>
                    <span style="color: #cd3636; font-size: 14px; font-family: 'Exo 2', sans-serif;">(<i class="pi pi-caret-down" style="font-size: 10px;"></i>${userQuantityAfter})</span> -
                    Обменял приз <span style="color: #4f4f4f; text-decoration: line-through;">${prizeName}(${prizeQuantity})</span>
                    на виртуальную валюту <span style="color: #5b9870;">${alternative}$</span>
                 </span>
                `
            }
            
        }
    }
}
</script>
<style>
    
</style>

