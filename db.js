import mysql from 'mysql2';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "root",
    database: process.env.MYSQL_DATABASE || "test"
}).promise()

export async function getUsers() {
	const [rows] = await pool.query("SELECT * FROM Users;");
	return rows[0];
}

export async function createUser(username, password) {
	try {
		const hashedPassword = await bcrypt.hash(password, 10);
		const [result] = await pool.query(`
		INSERT INTO Users (username, password)
		VALUES (?, ?)
		`, [username, hashedPassword]);
		return result.insertId;
	} catch (err) {
		if (err.code === 'ER_DUP_ENTRY') {
			throw new Error('Username already exists');
		}
		throw err;
	}
}

export async function deleteUser(username) {
	try {
		const [nameCheck] = await pool.query(`
		SELECT count(*) FROM Users
		WHERE username = ?
		`, [username]);

		if (nameCheck[0]['count(*)'] === 0) {
			throw new Error('Username does not exist');
		}
		
		const [result] = await pool.query(`
		DELETE FROM Users
		WHERE username = ?
		`, [username]);

		return result.affectedRows;
	} catch (err) {
		throw err;	
	}
}

export async function getSwitchState() {
	const [rows] = await pool.query("SELECT switch_state FROM Switches;");
	return rows[0].switch_state;
}

export async function changeSwitchState(id, state) {
	const [result] = await pool.query(`
	UPDATE Switches
	SET switch_state = ? 
	WHERE id = ?;
	`, [state, id]);
	return result.insertId;
}

export async function validateUser(username, password) {
	const [rows] = await pool.query(`
	SELECT * FROM Users
	WHERE username = ?
	`, [username]);

	if (rows.length > 0) {
		const user = rows[0];
		const match = await bcrypt.compare(password, user.password);
		if (match) {
			return user;
		}
	}

	throw new Error('Invalid username or password');
}
//const test = await createUser('tester2', 'test');
//console.log(test);

//const test = await validateUser('test', 'test');
//console.log(test);

//const test = await deleteUser('test');
//console.log(test);
