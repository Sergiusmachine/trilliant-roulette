<template>
    <footer class="footer">
        <p>created by <span>John Hartman</span></p>
        <p style="text-align: center;">Нашел баг или есть предложения по улучшению сайта? <br> Discord для связи - <span>sergiusmachine</span></p>
    </footer>
</template>
<script>
export default {
    
}
</script>
<style scoped>
    .footer {
        display: flex;
        justify-content: space-around;
        align-items: center;
        padding: 40px 0;
    }

    p {
        font-size: 12px;
        color: #5a5a5a;
    }

    span {
        color: #828282;
    }

    @media (max-width: 550px) {
        footer {
            display: block !important; 
            text-align: center !important;
        }
    }
</style>