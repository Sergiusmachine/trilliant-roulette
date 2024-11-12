import express from 'express';
import pkg from 'pg';
import cors from 'cors';
import { json } from 'express';
import path from 'path';

const { Pool } = pkg;
const app = express();

const pool = new Pool({
    user: 'postgres',
    password: '123123qwe',
    host: '176.114.67.27',
    database: 'trilliant',
    port: 5432,
});

app.use(cors({
    origin: ['http://localhost:5173', 'http://176.114.67.27']
}));
app.use(json());

const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, 'public')));

// Вернуть количество рулеток
app.post('/quantity', async (req, res) => {
    const { username } = req.body
    try {
        const result = await pool.query('SELECT quantity FROM users WHERE username = $1', [username])
        if(result.rows.length > 0) {
            const quantity = result.rows[0].quantity
            res.json({ quantity })
        } else {
            res.status(404).json({ error: 'Пользователь не найден' })
        }
    } catch (error) {
        console.error('Ошибка выполнения запроса к базе данных:', error);
        res.status(500).json({ error: 'Ошибка сервера при получении данных' });
    }
})

// Уменьшить количество рулеток
app.put('/updateQuantity', async (req, res) => {
    const { username, quantity } = req.body
    try {
        const updateQuery = 'UPDATE users SET quantity = $1 WHERE username = $2'
        const result = await pool.query(updateQuery, [quantity, username])
        res.sendStatus(204)
    } catch (err) {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
})

// Добавить приз в базу данных
app.post('/getPrize', async (req ,res) => {
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
app.post('/sellPrize', async (req ,res) => {
    const { username, prizeName, alternative } = req.body
    try {
        const insertQuery = 'INSERT INTO user_prizes (username, prize_name, quantity) VALUES ($1, $2, $3)';
        await pool.query(insertQuery, [username, prizeName, alternative]);
        res.sendStatus(204)
    } catch {
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
})

// Получить список призов
app.post('/getPrizeList', async (req, res) => {
    const { username } = req.body
    try {
        const data = 'SELECT * FROM user_prizes WHERE username = $1'
        const result = await pool.query(data, [username])
        res.json(result.rows)
    } catch {
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Получить админу список призов всех игроков
app.post('/getUserPrizes', async (req, res) => {
    try {
        const data = 'SELECT * FROM user_prizes'
        const result = await pool.query(data)
        res.json(result.rows)
    } catch {
        res.status(500).json({ success: false, message: 'Ошибка сервера' })
    }
})

// Удаление призов из базы данных
app.delete('/deletePrize', async (req, res) => {
    const { username } = req.body

    try {
        const data = 'DELETE FROM user_prizes WHERE username = $1'
        await pool.query(data, [username])
        res.status(200).json({ success: true, message: 'Призы успешно удалены' });
    } catch {
        console.error('Ошибка при удалении призов:', error);
        res.status(500).json({ success: false, message: 'Ошибка сервера' });
    }
})

// Начислить рулетки через админку
app.post('/addQuantity', async (req, res) => {
    const { username, quantity } = req.body
    
    try {
        const data = 'UPDATE users SET quantity = quantity + $1 WHERE username = $2'
        const result = await pool.query(data, [quantity, username])
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        } else {
            return res.status(200).json({ message: `Пользователю ${username} добавлено ${quantity} рулеток` })
        }
    } catch {
        console.error('Ошибка при обновлении quantity:', error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
})

// Зарегистрировать нового пользователя
app.post('/addUser', async (req, res) => {
    const { username, password } = req.body
    
    try {
        const data = 'INSERT INTO users (username, password) VALUES ($1, $2)'
        await pool.query(data, [username, password])
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
app.post('/checkAdmin', async (req, res) => {
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

// Авторизация
app.post('/login', async (req, res) => {
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
app.put('/updatePassword', async (req, res) => {
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


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});