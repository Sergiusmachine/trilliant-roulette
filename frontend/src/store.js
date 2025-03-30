import { createStore } from 'vuex';

export default createStore({
    state: {
        user: {
            name: '',
            quantity: '',
            todayQuantity: '',
            authorization: false,
            isAdmin: false,
            isBanned: false,
        },
        notification: {
            message: 'message',
            condition: undefined,
            show: false,
        }
    },

    getters: {},

    mutations: {
        SET_AUTHORIZATION(state, payload) {
            state.user.authorization = payload; // Установка статуса авторизации
        },
        SET_USERNAME(state, payload) {
            state.user.name = payload; // Установка имени пользователя
        },
        SET_QUANTITY(state, payload) {
            state.user.quantity = payload
        },
        SET_IS_ADMIN(state, payload) {
            state.user.isAdmin = payload;
        },
        SET_TODAY_QUANTITY(state, payload) {
            state.user.todayQuantity = payload
        },
        SET_NOTFICATION_MESSAGE(state, { message, condition, show }) {
            state.notification.message = message;
            state.notification.condition = condition;
            state.notification.show = show;
        },
    },

    actions: {
        // Авторизация
        async login({ commit, dispatch }, { name, password }) {
            try {
                const response = await fetch('https://trilliantroulette.ru/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, password }),
                });
                const data = await response.json();
        
                if (response.ok) {
                    commit('SET_AUTHORIZATION', true); // Установка авторизации в true
                    commit('SET_USERNAME', name); // Установка имени пользователя
                    commit('SET_IS_ADMIN', true)
                    localStorage.setItem('username', name);
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('isAdmin', 'true');
                    dispatch('startAdminCheck');
                } else {
                    // Если сервер вернул ошибку, выбрасываем её
                    throw new Error(data.message);
                }
            } catch (error) {
                // Пробрасываем ошибку наверх
                throw error;
            }
        },

        // Получаем количество рулеток из БД
        async getQuantity({ commit, state }) {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/quantity', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: state.user.name }),
                })
                if (!res.ok) {
                    throw new Error(`Ошибка запроса: ${res.status}`);
                }
                const data = await res.json()
                if(data.quantity !== undefined) {
                    commit('SET_QUANTITY', data.quantity)
                    commit('SET_TODAY_QUANTITY', data.todayquantity)
                } else {
                    throw new Error('Ответ не содержит "quantity"');
                }
            } catch(error) {
                console.error('Ошибка получения результата', error)
            }
        },

        // Уменьшаем количество рулеток
        async decreaseQuantity({ commit, state }) {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/updateQuantity', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: state.user.name,
                    })
                })
                const data = await res.json()
                if(res.ok) {
                    commit('SET_QUANTITY', data.quantity)
                    commit('SET_TODAY_QUANTITY', data.todayQuantity)
                } else {
                    throw new Error('Недостаточно рулеток');
                }
            } catch(error) {
                console.error('Ошибка при обновлении quantity:', error);
                throw error
            }
        },

        // Увеличиваем количество рулеток(респин)
        async increaseQuantity({ commit, state, dispatch }) {
            const newQuantity = state.user.quantity + 1
            await dispatch('updateQuantity', newQuantity)
        },

        // Проверка авторизации
        checkAuth({ commit }) {
            const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
            const username = localStorage.getItem('username') || '';
            const isAdmin = localStorage.getItem('isAdmin') === 'true';
            commit('SET_AUTHORIZATION', isAuthenticated);
            commit('SET_USERNAME', username);
            commit('SET_IS_ADMIN', isAdmin);
        },

        // Проверка прав администратора
        async startAdminCheck({ commit, state }) {
            try {
                const res = await fetch('https://trilliantroulette.ru/api/checkAdmin', {
                    method: 'POST',
                    headers: {
                    'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: state.user.name }),
                });
                const adminData = await res.json();
                if (adminData.admin !== undefined) {
                    commit('SET_IS_ADMIN', adminData.admin);
                    localStorage.setItem('isAdmin', adminData.admin);
                }
                } catch (error) {
                console.error('Ошибка при проверке прав администратора', error);
            }
        },

        logout({ commit }) {
            commit('SET_AUTHORIZATION', false); // Устанавливаем авторизацию в false
            commit('SET_USERNAME', ''); // Очищаем имя пользователя
            commit('SET_ADMIN', false)
            commit('CLEAR_ADMIN_CHECK_INTERVAL');
            // Удаляем данные из localStorage
            localStorage.removeItem('username');
            localStorage.removeItem('isAuthenticated');
        },

        // Управление уведомлениями
        notification({ commit }, { message, condition, show }) {
            commit('SET_NOTFICATION_MESSAGE', { message, condition, show });
        },
    },
});