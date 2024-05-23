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

async function toggleSwitch(id, state) {
	clients.forEach((client) => {
		if (client.readyState === client.OPEN) {
			client.send(state);
		}
	});

	if (clients.size == 0) {
		throw new Error('Switch not connected');
	}

	const switchId = await changeSwitchState(id, state);

	browsers.forEach((browser) => {
		if (browser.readyState === browser.OPEN) {
			browser.send(JSON.stringify({
				type: 'updateSwitchState'
			}));
		}
	});

	return switchId;
}

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
		if (!request.session.role) {
			throw new Error('Not logged in');
		}

		const { id, state } = request.body;

		// Alert WebSocket connection (alerts all connections)
		// Behaviour might be extended if we add handling of multiple switches

		const switchId = await toggleSwitch(id, state);
		response.send(switchId.toString())
	} catch (err) {
		if (err.message == 'Switch not connected') {
			response.status(503).send('Switch not connected');
		} else if (err.message == 'Not logged in') {
			response.status(503).send('Please log in for this functionality');
		} else {
			response.status(500).send('error');
		}
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

app.post('/voice_command', async (request, response) => {
	try {
		if (!request.session.role) {
			throw new Error('Not logged in');
		}

		const { id, command } = request.body;	
		console.log('Received voice command: ', command);

		if (command.includes('turn on') || command.includes('Turn on')) {
			const state = 1;
			const switchId = await toggleSwitch(id, state);
		} else if (command.includes('turn off') || command.includes('Turn off')) {
			const state = 0;
			const switchId = await toggleSwitch(id, state);
		}
		response.send(id.toString());
	} catch (err) {
		if (err.message == 'Switch not connected') {
			response.status(503).send('Switch not connected');
		} else if (err.message == 'Not logged in') {
			response.status(503).send('Please log in for this functionality');
		} else {
			response.status(500).send('error');
		}
	}
});

app.get('/login', async (req, res) => {
	try {
		res.send( await readFile('./login.html', 'utf8') );
	} catch (err) {
		res.status(500).send('Error with login file');
	}
});

app.post('/login', async (request, response) => {
	try {
		const { username, password } = request.body;
		const user = await validateUser(username, password);
		request.session.username = user.username;
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

app.post('/logout', async (request, response) => {
	try {
		request.session.destroy(err => {
			if (err) {
				return response.status(500).send('Failed to log out');
			}
			response.clearCookie('connect.sid');
			response.send('Logged out');
		});
	} catch (err) {
		response.status(500).send('error');
	}
});

app.get('/session_info', async (request, response) => {
	try {
		if (request.session) {
			response.json(request.session);
		} else {
			response.status(404).send('No session found');
		}
	} catch (err) {
		response.status(500).send('error');
	}
});

app.get('/timer', async (request, response) => {
	try {
		response.send( await readFile('./timer.html', 'utf8') );
	} catch (err) {
		response.status(500).send('error');
	}
});

app.get('/settings', async (request, response) => {
	try {
		response.send( await readFile('./settings.html', 'utf8') );
	} catch (err) {
		response.status(500).send('error');
	}
});

let timers = [];

app.post('/timer', async (request, response) => {
	try {
		if (!request.session.role) {
			throw new Error('Not logged in');
		}

		const { time, action } = request.body;
		const now = new Date();
		const [hours, minutes] = time.split(':').map(Number);
		const targetTime = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes));

		console.log(hours, minutes);
		console.log(now);
		console.log(targetTime);

		if (targetTime < now) {
			throw new Error('Time already elapsed');
		}

		const delay = targetTime - now;

		timers.forEach((timer) => {
			if (timer.time === time) {
				throw new Error('Time taken');
			}
		});

		const timerId = setTimeout(async () => {
			try {
				let state = -1;
				if (action === 'on') {
					state = 1;
				} else if (action === 'off') {
					state = 0;
				} else {
					const cur_status = await getSwitchState();
					state = cur_status === 0 ? 1 : 0;
				}

				await toggleSwitch(1, state);
			} catch (err) {
				if (err.message === 'Switch not connected') {
					console.error("Switch was not connected when timer went off");
				}

				console.error(err);
			} finally {
				const idx = timers.findIndex(t => t.timerId === timerId);
				if (idx !== -1) timers.splice(idx, 1);
			}
		}, delay);

		timers.push({ timerId, time, action });

		response.send(`Timer set for ${time} with action '${action}'`);
	} catch (err) {
		if (err.message === 'Not logged in') {
			response.status(503).send('Please log in for this functionality');
		} else if (err.message === 'Time already elapsed') {
			response.status(503).send('Time already elapsed, try again');
		} else if (err.message === 'Time taken') {
			response.status(503).send('Timer with same timestamp already exists');
		} else {
			response.status(500).send('error');
		}
	}
});

app.get('/active_timers', async (request, response) => {
	try {
		const clientTimers = timers.map(({ time, action }) => ({ time, action }));
		response.json(clientTimers);
	} catch (err) {
		console.log(err);
		response.status(500).send('err');
	}
});

app.post('/clear_timers', async (request, response) => {
	try {
		timers.forEach(timer => clearTimeout(timer.timerId));
		timers = [];
		response.send('Timers cleared');
	} catch (err) {
		console.log(err);
		response.status(500).send('err');
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

app.ws('/ws/pi', (ws, request) => {
	console.log("New Raspberry Pi WebSocket connection"); 
	clients.add(ws);

	ws.on('close', () => {
		console.log("Raspberry Pi WebSocket connection closed");
		clients.delete(ws);
	});
});

const browsers = new Set();

app.ws('/ws/browser', (ws, request) => {
	console.log("New Browser WebSocket connection"); 
	browsers.add(ws);

	ws.on('close', () => {
		console.log("Browser WebSocket connection closed");
		clients.delete(ws);
	});
});

app.listen(process.env.PORT || port, () => console.log(`App available on localhost: ${port}`))
