<template>
    <div class="logo">
        <img class="logo-img" src="/assets/logo.svg" alt="">
        <router-link to="/roulette" class="logo-link">Trilliant Roulette</router-link>
    </div>
</template>

<style>
    .logo {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .logo-img {
        width: 25px;
        height: 25px;
        margin-right: 10px;
    }

    .logo-link {
        font-size: 27px;
        font-weight: 400;
    }

    @media(max-width: 400px) {
        .logo-link {
            font-size: 20px;
        }

        .logo-img {
            width: 18px;
            height: 18px;
        }
    }
</style>