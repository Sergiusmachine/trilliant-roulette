import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import { json } from 'express';
import path from 'path';
import schedule from 'node-schedule'


const { Pool } = pkg;
const app = express();

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

app.use(cors({
    origin: ['http://localhost:5173', 'http://176.114.67.27', 'http://trilliantroulette.ru', 'https://trilliantroulette.ru']
}));
app.use(json());

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Обновить счетчик
async function updateTodayQuantity() {
    try {
        const query = 'UPDATE users SET todayquantity = CASE WHEN accnumber = 1501549 THEN 5 ELSE 3 END';
        await pool.query(query);
    } catch (err) {
        console.error('Error updating todayquantity:', err.message);
    }
}

// Запланированное удаление старых логов
async function deleteOldLogs() {
    try {
        const query = `DELETE FROM logs WHERE timestamp < NOW() - INTERVAL '7 days'`;
        await pool.query(query);
    } catch (err) {
        console.error('Error deleting old logs:', err.message);
    }
}

// Запланировать выполнение обновления счетчика на 00:00 по МСК
const job = schedule.scheduleJob({ hour: 21, minute: 0, tz: 'Etc/UTC' }, () => {
    console.log('Running scheduled task to update todayquantity');
    updateTodayQuantity();
    deleteOldLogs();
});

// Получить админу информацию о пользователе
app.post('/api/getInfo', async (req, res) => {
    const { username } = req.body
    try {
        const result = await pool.query('SELECT username, admin, quantity, todayquantity, accnumber FROM users WHERE username = $1', [username])
        if(result.rows.length > 0) {
            const { username, admin, quantity, todayquantity, accnumber } = result.rows[0]
            res.status(200).json({ username, admin, quantity, todayquantity, accnumber })
        } else {
            res.status(404).json({ error: 'Пользователь не найден' })
        }
    } catch (error) {
        console.error('Ошибка выполнения запроса к базе данных:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении данных' });
    }
})

// Изменить админу ник для пользователя
app.put('/api/changeName', async (req, res) => {
    const { admin, action, form } = req.body;
    const username = form.username
    const newUsername = form.newUsername

    try {
        const result = await pool.query(
            'UPDATE users SET username = $2 WHERE username = $1',
            [username, newUsername]
        );

        if (result.rowCount > 0) {
            const log = 'INSERT INTO logs (admin, action, username, newname) VALUES ($1, $2, $3, $4)'
            await pool.query(log, [admin, action, username, newUsername])
            res.status(200).json({ success: true, message: 'Ник пользователя успешно изменен' });
        } else {
            res.status(404).json({ success: false, message: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка при обновлении имени пользователя:', error);
        res.status(500).json({ success: false, message: 'Пользователь с таким ником уже существует' });
    }
});

// Вернуть количество рулеток
app.post('/api/quantity', async (req, res) => {
    const { username } = req.body
    try {
        const result = await pool.query('SELECT quantity, todayquantity FROM users WHERE username = $1', [username])
        if(result.rows.length > 0) {
            const { quantity, todayquantity } = result.rows[0]
            res.status(200).json({ quantity, todayquantity })
        } else {
            res.status(404).json({ error: 'Пользователь не найден' })
        }
    } catch (error) {
        console.error('Ошибка выполнения запроса к базе данных:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении данных' });
    }
})

// Уменьшить количество рулеток
app.put('/api/updateQuantity', async (req, res) => {
    const { username } = req.body
    try {
        const updateQuery = 'UPDATE users SET quantity = quantity - 1, todayquantity = todayquantity - 1 WHERE username = $1 AND quantity > 0 RETURNING quantity, todayquantity;'
        const result = await pool.query(updateQuery, [username])
        if (result.rows.length === 0) {
            return res.status(400).json({ success: false, message: 'Недостаточно рулеток' });
        }
        const newQuantity = result.rows[0].quantity;
        const newTodayQuantity = result.rows[0].todayquantity;
        res.status(200).json({ success: true, quantity: newQuantity, todayQuantity: newTodayQuantity });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
})

// Добавить приз в базу данных
app.post('/api/getPrize', async (req ,res) => {
    const { username, prizeName, quantity } = req.body
    try {
        const insertQuery = 'INSERT INTO user_prizes (username, prize_name, quantity) VALUES ($1, $2, $3)';
        await pool.query(insertQuery, [username, prizeName, quantity]);
        res.sendStatus(204)
    } catch {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
})

// Добавить компенсацию за приз в базу данных
app.post('/api/sellPrize', async (req ,res) => {
    const { username, prizeName, alternative, quantity } = req.body
    try {
        const deleteQuery = 'DELETE FROM user_prizes WHERE username = $1 AND prize_name = $2 AND quantity = $3'
        const insertQuery = 'INSERT INTO user_prizes (username, prize_name, quantity) VALUES ($1, $2, $3)';
        await pool.query('BEGIN'); // Начинаем транзакцию
        await pool.query(deleteQuery, [username, prizeName, quantity]);
        await pool.query(insertQuery, [username, 'Игровая валюта', alternative]);
        await pool.query('COMMIT'); // Завершаем транзакцию
        res.sendStatus(204);
    } catch {
        await pool.query('ROLLBACK'); // Откатываем изменения при ошибке
        console.error(err);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
})

// Получить игроку список своих призов
app.post('/api/getPrizeList', async (req, res) => {
    const { username } = req.body
    try {
        const data = 'SELECT * FROM user_prizes WHERE username = $1'
        const result = await pool.query(data, [username])
        res.json(result.rows)
    } catch {
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Получить ники всех пользователей для админки
app.post('/api/getUsers', async (req, res) => {
    try {
        const data = 'SELECT username FROM users'
        const result = await pool.query(data)
        res.json(result.rows)
    } catch {
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Получить админу список призов всех игроков
app.post('/api/getUserPrizes', async (req, res) => {
    try {
        const data = 'SELECT * FROM user_prizes'
        const result = await pool.query(data)
        res.json(result.rows)
    } catch {
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Удаление призов из базы данных
app.delete('/api/deletePrize', async (req, res) => {
    const { admin, action, username, checkedItems } = req.body

    try {
        for(let prize of checkedItems) {
            const prizeName = prize.prizeName
            if(prize.state) {
                if(prize.quantity < 2) {
                    const quantity = prize.quantity
                    const deleteData = 'DELETE FROM user_prizes WHERE id = $1'
                    const result = await pool.query(deleteData, [prize.id])
                    if(result.rowCount > 0) {
                        const log = 'INSERT INTO logs (admin, action, username, prize_name, quantity) VALUES ($1, $2, $3, $4, $5)'
                        await pool.query(log, [admin, action, username, prizeName, quantity])
                    }
                } else {
                    const quantity = prize.quantity
                    const deleteData = 'DELETE FROM user_prizes WHERE prize_name = $1 AND username = $2'
                    const result = await pool.query(deleteData, [prize.prizeName, username])
                    if(result.rowCount > 0) {
                        const log = 'INSERT INTO logs (admin, action, username, prize_name, quantity) VALUES ($1, $2, $3, $4, $5)'
                        await pool.query(log, [admin, action, username, prizeName, quantity])
                    }
                }
            }
        }
        res.status(200).json({ success: true, message: 'Призы успешно удалены' });
    } catch(error) {
        console.error('Ошибка при удалении призов:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
})

// Изменить количество рулеток через админку
app.post('/api/addQuantity', async (req, res) => {
    const { admin, action, form} = req.body
    const username = form.username
    const quantity = form.quantity
    const option = form.option
    
    try {
        let data;
        if(option === 'Выдать рулетки') {
            data = 'UPDATE users SET quantity = quantity + $1 WHERE username = $2'
        } else if(option === 'Увеличить дневной лимит') {
            data = 'UPDATE users SET todayquantity = todayquantity + $1 WHERE username = $2'
        } else if(option === 'Забрать рулетки') {
            data = 'UPDATE users SET quantity = quantity - $1 WHERE username = $2 AND quantity >= $1'
        }
        
        const result = await pool.query(data, [quantity, username])
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден или введены неверные значения' });
        } else {
            const log = 'INSERT INTO logs (admin, action, username, quantity) VALUES ($1, $2, $3, $4)'
            await pool.query(log, [admin, action, username, quantity])
            return res.status(200).json({ message: `Пользователю ${username} добавлено ${quantity} рулеток` })
        }
        
    } catch {
        console.error('Ошибка при обновлении quantity:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
})

// Зарегистрировать нового пользователя
app.post('/api/addUser', async (req, res) => {
    const { admin, action, form } = req.body
    const username = form.username
    const password = form.password
    const accNumber = form.accNumber
    
    try {
        const data = 'INSERT INTO users (username, password, accnumber) VALUES ($1, $2, $3)'
        const result = await pool.query(data, [username, password, accNumber])

        if(result.rowCount > 0) {
            const log = 'INSERT INTO logs (admin, action, username) VALUES ($1, $2, $3)'
            await pool.query(log, [admin, action, username])
        }

        res.status(200).json()
    } catch(error) {
        if(error.code === '23505') {
            res.status(409).json()
        } else {
            console.error('Ошибка при добавлении пользователя:', error)
            res.status(500).json({ message: 'Ошибка сервера' })
        }
    }
})

// Проверка прав администратора
app.post('/api/checkAdmin', async (req, res) => {
    const { username } = req.body;
    let client;

    try {
        client = await pool.connect();
        const result = await client.query('SELECT admin FROM users WHERE username = $1', [username]);
        
        if (result.rows.length > 0) {
            res.status(200).json({ admin: result.rows[0].admin });
        } else {
            res.status(404).json({ message: 'Пользователь не найден' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при проверке прав' });
    } finally {
        if (client) {
            client.release();
        }
    }
});

// Проверка на бан
app.post('/api/checkBan', async (req, res) => {
    const { username } = req.body;

    try {
        const result = await pool.query('SELECT * FROM ban_list WHERE username = $1', [username])

        if (result.rows.length > 0) {
            res.status(200).json({ reason: result.rows[0].reason });
        } else {
            res.status(404).json({ message: 'Пользователь не находится в бан-листе' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при проверке на бан' });
    }
})

// Авторизация
app.post('/api/login', async (req, res) => {
    const { name, password } = req.body;
    let client;

    try {
        client = await pool.connect();
        const result = await client.query('SELECT * FROM users WHERE username = $1 AND password = $2', [name, password]);

        if (result.rows.length > 0) {
            const user = result.rows[0];
            res.status(200).json({ 
                message: 'Вход успешен',
                isAdmin: user.admin
            });
        } else {
            res.status(401).json({ message: 'Неправильное имя пользователя или пароль' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Ошибка при входе' });
    } finally {
        if (client) {
            client.release(); // Освобождаем клиент только если он был инициализирован
        }
    }
});

// Смена пароля
app.put('/api/updatePassword', async (req, res) => {
    const { password, username } = req.body

    try {
        const data = 'UPDATE users SET password = $1 WHERE username = $2'
        const result = await pool.query(data, [password, username])
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.status(200).json()
    } catch {
        res.status(500).json()
    }
})

// Получить список логов
app.get('/api/getLogs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM logs ORDER BY id ASC')
        res.json(result.rows);
    } catch(err) {
        res.status(404).json(err)
    }
})


const PORT = 8000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});