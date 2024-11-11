import { createRouter, createWebHistory } from 'vue-router';
import store from './store'
import Login from './pages/Login.vue'
import Roulette from './pages/Roulette.vue'
import Registration from './pages/Registration.vue'
import Admin from './pages/Admin.vue'
import Prizes from './pages/Prizes.vue'
import Settings from './pages/Settings.vue'

const routes = [
    {
        path: '/',
        redirect: '/roulette'
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin,
        beforeEnter: (to, from, next) => {
            if (store.state.user.authorization && store.state.user.isAdmin) {
                next();
            } else {
                next('/');
            }
        },
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings,
        beforeEnter: (to, from, next) => {
            if (store.state.user.authorization) {
                next();
            } else {
                next('/');
            }
        },
    },
    {
        path: '/prizes',
        name: 'Prizes',
        component: Prizes,
        beforeEnter: (to, from, next) => {
            if (store.state.user.authorization) {
                next();
            } else {
                next('/');
            }
        },
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        beforeEnter: (to, from, next) => {
            if (!store.state.user.authorization) {
                next();
            } else {
                next('/');
            }
        },
    },
    {
        path: '/roulette',
        name: 'Roulette',
        component: Roulette,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
});
  
export default router;