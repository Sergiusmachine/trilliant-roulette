<template>
    <div class="notification" v-if="$store.state.notification.show">
        <h4 class="condition" v-if="$store.state.notification.condition === false"><i class="pi pi-exclamation-circle"></i>Warning</h4>
        <h4 class="condition" v-if="$store.state.notification.condition === true"><i class="pi pi-check"></i>Success</h4>
        <p>{{ $store.state.notification.message }}</p>
    </div>
</template>
<script>
export default {
  watch: {
    // Слежение за изменением show
    '$store.state.notification.show'(newValue) {
      if (newValue) {
        setTimeout(() => {
          this.$store.dispatch('notification', {
            message: '',
            condition: undefined,
            show: false,
          });
        }, 4000);
      }
    },
  },
}
</script>
<style scoped>
    .notification {
        position: fixed;
        bottom: 15px;
        right: 15px;
        width: 350px;
        background-color: #1b1b1b;
        border-radius: 5px;
        padding: 15px 30px;
        transition: ease .2s all;
    }

    .pi-exclamation-circle {
        color: #cc3a3a;
        margin-right: 10px;
    }

    .pi-check {
        color: green;
        margin-right: 10px;
    }

    .condition {
        margin: 5px 0 10px 0;
    }

    @media (max-width: 768px) {
        .notification {
            width: 80%;
            left: 50%;
            transform: translateX(-50%);
            box-sizing: border-box;
            text-align: center;
            padding: 10px 20px;
        }
    }

    @media (max-width: 450px) {
        .notification {
            width: 90%;
            text-align: center;
        }
    }
</style>