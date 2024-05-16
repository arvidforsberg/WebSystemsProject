import express from 'express';
import session from 'express-session';
import expressWs from 'express-ws';

import { readFile } from 'fs/promises';
import { getUsers, getSwitchState, changeSwitchState, createUser, validateUser } from './db.js';

const app = express();
const port = 3000;

const expressWsInstance = expressWs(app);

app.use(express.static(process.cwd()));
app.use(express.json());
app.use(session({
	secret: 'fett hemligt',
	resave: false,
	saveUninitialized: true,
	cookie: { secure: false }
}));

app.get('/', async (request, response) => {
	try {	
		response.send( await readFile('./index.html', 'utf8') );
	}  catch (err) {
		response.status(500).send('error');
	}
});
	
app.get('/users', async (request, response) => {
	try {
		const users = await getUsers();
		response.send(JSON.stringify(users));
	} catch (err) {
		response.status(500).send('error');
	}
});

app.get('/switch', async (request, response) => {
	try {
		const state = await getSwitchState();
		response.send(JSON.stringify(state));
	} catch (err) {
		response.status(500).send('error');
	}
});

app.post('/switch', async (request, response) => {
	try {
		const { id, state } = request.body;
		const switchId = await changeSwitchState(id, state);

		// Alert WebSocket connection	
		clients.forEach((client) => {
			if (client.readyState === client.OPEN) {
				client.send(state);
			}
		});

		response.send(switchId.toString());
	} catch (err) {
		response.status(500).send('error');
	}
});

app.post('/create_user', async (request, response) => {
	try {
		const { username, password } = request.body;
		const id = await createUser(username, password);
		response.status(201).send(id.toString());
	} catch (err) {
		if (err.message === 'Username already exists') {
			response.status(400).send('Username already exists');
		} else {
			response.status(500).send('error');
		}
	}
});

app.post('/login', async (request, response) => {
	try {
		const { username, password } = request.body;
		const user = await validateUser(username, password);
		request.session.role = user.role;
		response.json( { role: user.role });
	} catch (err) {
		if (err.message === 'Invalid username or password') {
			response.status(400).send('Invalid username or password');
		} else {
			response.status(500).send('error');
		}
	}
});

app.get('/admin', async (request, response) => {
	try {	
		if (request.session.role === 'admin') {
			response.send( await readFile('./admin.html', 'utf8') );
		} else {
			response.status(401).send('Unauthorized');
		}
	}  catch (err) {
		response.status(500).send('error');
	}
});

// WebSocket endpoints

// echo endpoint for testing
//app.ws('/echo', (ws, request) => {
//	ws.on('message', (msg) => {
//		ws.send(message);
//	});
//});

const clients = new Set(); // Stored in a set in case we wanted to expand functionality to handle multiple switches

app.ws('/ws', (ws, request) => {
	console.log("New WebSocket connection"); 
	clients.add(ws);

	ws.on('close', () => {
		console.log("WebSocket connection closed");
		clients.delete(ws);
	});
});

app.listen(process.env.PORT || port, () => console.log(`App available on localhost: ${port}`))
