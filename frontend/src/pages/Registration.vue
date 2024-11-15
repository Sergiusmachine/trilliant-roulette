<template>
    <div class="container">
        
        <div class="reg">
            <Logo class="logo"/>
            <h1 class="title">Регистрация</h1>
            <form>
                <input class="input" type="text" placeholder="Ваш ник на сервере">
                <input class="input" type="text" placeholder="Придумайте пароль">
                <input class="input" type="text" placeholder="Повторите пароль">
                <button type="submit" class="btn">Готово</button>
            </form>
        </div>
    </div>
</template>

<script>
import Logo from '../components/Logo.vue'
export default {
    components: {
        Logo,
    }
}
</script>

<style scoped>
    .logo {
        margin-bottom: 40px;
    }
    .container {
        width: 100%;
        margin-top: 100px;
    }
    .reg {
        width: 30%;
        max-width: 350px;
        margin: 70px auto;
        text-align: center;
        border-radius: 5px;
        padding: 30px 50px 20px 50px;
        background-color: rgb(66, 85, 131, .2);
    }
    .title {
        margin: 0 0 40px 0;
        font-size: 25px;
    }
    .input {
        margin-bottom: 20px;
        padding: 10px 13px;
        width: 90%;
        background-color: #fff;
        border: none;
        border-radius: 5px;
        font-size: 15px;
    }
    .input:focus {
        outline: none;
    }
    .btn {
        padding: 8px 22px;
        background-color: #7ecb6c;
        border: none;
        border-radius: 5px;
        margin-bottom: 15px;
        cursor: pointer;
        transition: .2s ease;
        font-size: 15px;
    }
    .btn:hover {
        background-color: #54c839;
    }
</style>