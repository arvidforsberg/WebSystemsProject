let current_status = false;
fetch("./switch")
.then((response) => response.json())
.then((json) => current_status = json);

async function updateStatus() {
	const status_text = document.getElementById("status_text");

	try {
		const res = await fetch("./switch");
		const cur_status = await res.json();
		console.log(cur_status);
		status_text.innerHTML = cur_status ? "On" : "Off";
	} catch(err) {
		console.log(err);
	}
}

window.onload = () => {
	const status_text = document.getElementById("status_text");

	if (current_status == 0) {
		status_text.innerHTML = "Off";
	} else {
		status_text.innerHTML = "On";
	}

	const btn_on = document.getElementById("btn_on");
	const btn_off = document.getElementById("btn_off");

	const createUserText = document.getElementById("create_account_p");
	const loginUserText = document.getElementById("login_p");

	const createUserForm = document.getElementById("create_account");
	const loginUserForm = document.getElementById("login");

	const returnText = document.getElementById("return");

	btn_on.addEventListener('click', async () => {
		try {
			const res = await fetch("./switch", {
				method: "post",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'id': 1,
					'state': 1
				})
			});

			await updateStatus();	
			console.log(res);
		} catch (err) {
			console.log(err);
		}
	});

	btn_off.addEventListener('click', async () => {
		try {
			const res = await fetch("./switch", {
				method: "post",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'id': 1,
					'state': 0
				})
			});

			await updateStatus();
			console.log(res);
		} catch (err) {
			console.log(err);
		}
	});

	createUserText.addEventListener('click', () => {
		createUserText.style.display = "none";
		loginUserText.style.display = "none";
		createUserForm.style.display = "flex";
		returnText.style.display = "inline";
	});

	loginUserText.addEventListener('click', () => {
		createUserText.style.display = "none";
		loginUserText.style.display = "none";
		loginUserForm.style.display = "flex";
		returnText.style.display = "inline";
	});

	createUserForm.addEventListener('submit', async (event) =>  {
		event.preventDefault();

		try {
			const formDataCreate = new FormData(createUserForm);
			const username_create = formDataCreate.get('username_create');
			const password_create = formDataCreate.get('password_create');

			if (!username_create || username_create.length < 3) {
				alert('Username must be at least 3 characters long!');
				return;
			}

			if (!password_create || password_create.length < 3) {
				alert('Password must be at least 3 characters long!');
				return;
			}

			const data = {
				'username': username_create,
				'password': password_create
			};

			const res = await fetch("./create_user", {
				method: "post",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!res.ok) {
				const errorMessage = await res.text();
				alert(errorMessage);
				return;
			}

			const id = await res.json();
			console.log('New account created with ID: ', id);
			alert("Account created");

			createUserForm.style.display = 'none';
			createUserText.style.display = 'inline';
			loginUserText.style.display = 'inline';
			returnText.style.display = 'none';

		} catch (err) {
			console.log(err);
		}
	});

	loginUserForm.addEventListener('submit', async (event) =>  {
		event.preventDefault();

		try {
			const formDataLogin = new FormData(loginUserForm);
			const username_login = formDataLogin.get('username_login');
			const password_login = formDataLogin.get('password_login');

			const data = {
				'username': username_login,
				'password': password_login
			};

			const res = await fetch("./login", {
				method: "post",
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(data)
			});

			if (!res.ok) {
				const errorMessage = await res.text();
				alert(errorMessage);
				return;
			}

			const user = await res.json();
			console.log('User logged in: ', user);
			const role = user.role;

			if (role === 'admin') {
				window.location.href = '/admin';
			} else if (role === 'normal') {
				window.location.href = '/normal';
			} else {
				window.location.href = '/guest';
			}

		} catch (err) {
			console.log(err);
		}
	});

	returnText.addEventListener('click', () => {
		createUserForm.style.display = 'none';
		loginUserForm.style.display = 'none';
		createUserText.style.display = 'inline';
		loginUserText.style.display = 'inline';
		returnText.style.display = 'none';
	});
}
