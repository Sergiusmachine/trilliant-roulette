import { createStore } from 'vuex';

export default createStore({
    state: {
        user: {
            name: '',
            quantity: '',
            authorization: false,
            isAdmin: false,
        },
        adminCheckInterval: null,
    },

    getters: {
        isAuthenticated(state) {
            return state.user.authorization;
        },
        username(state) {
            return state.user.name;
        },
        admin(state) {
            return state.user.isAdmin;
        },
        quantity(state) {
            return state.user.quantity
        }
    },

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
            state.user.isAdmin = payload; // Установите isAdmin
        },
        SET_ADMIN_CHECK_INTERVAL(state, intervalId) {
            state.adminCheckInterval = intervalId;
        },
        CLEAR_ADMIN_CHECK_INTERVAL(state) {
            clearInterval(state.adminCheckInterval);
            state.adminCheckInterval = null;
        },
    },

    actions: {
        // Авторизация
        async login({ commit, dispatch }, { name, password }) {
            try {
                const response = await fetch('http://176.114.67.27/api/login', {
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
                const res = await fetch('http://176.114.67.27/api/quantity', {
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
                } else {
                    throw new Error('Ответ не содержит "quantity"');
                }
            } catch(error) {
                console.error('Ошибка получения результата', error)
            }
        },

        // Изменение количества рулеток общая функция
        async updateQuantity({ commit, state }, newQuantity) {
            if(state.user.quantity > 0) {
                commit('SET_QUANTITY', newQuantity)
                try {
                    const res = await fetch('http://176.114.67.27/api/updateQuantity', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            username: state.user.name,
                            quantity: newQuantity
                        })
                    })
                } catch(error) {
                    console.error('Ошибка при обновлении quantity:', error);
                } 
            } 
        },

        // Уменьшаем количество рулеток
        async decreaseQuantity({ commit, state, dispatch }) {
            if(state.user.quantity > 0) {
                const newQuantity = state.user.quantity - 1
                await dispatch('updateQuantity', newQuantity)
            }
        },

        // Увеличиваем количество рулеток(респин)
        async increaseQuantity({ commit, state, dispatch }) {
            if(state.user.quantity > 0) {
                const newQuantity = state.user.quantity + 1
                await dispatch('updateQuantity', newQuantity)
            }
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
                const res = await fetch('http://176.114.67.27/api/checkAdmin', {
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
    },
});










// Проверка прав администратора
        // async startAdminCheck({ commit, state }) {
        //     // Остановка предыдущего интервала (если есть)
        //     if (state.adminCheckInterval) {
        //       commit('CLEAR_ADMIN_CHECK_INTERVAL');
        //     }
      
        //     // Запуск нового интервала проверки прав администратора
        //     const intervalId = setInterval(async () => {
        //       try {
        //         const res = await fetch('http://176.114.67.27/api/checkAdmin', {
        //           method: 'POST',
        //           headers: {
        //             'Content-Type': 'application/json',
        //           },
        //           body: JSON.stringify({ username: state.user.name }),
        //         });
        //         const adminData = await res.json();
        //         if (adminData.admin !== undefined) {
        //           commit('SET_ADMIN', adminData.admin);
        //           localStorage.setItem('isAdmin', adminData.admin);
        //         }
        //       } catch (error) {
        //         console.error('Ошибка при проверке прав администратора', error);
        //       }
        //     }, 10000);
      
        //     // Сохранение ID интервала
        //     commit('SET_ADMIN_CHECK_INTERVAL', intervalId);
        // },