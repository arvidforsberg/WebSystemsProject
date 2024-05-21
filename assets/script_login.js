window.onload = () => {
	update_session(true);

	const logout_btn = document.getElementById('logout-button');
	const session_text = document.getElementById('user-info');
	const accountForm = document.getElementById('account-form');	

	logout_btn.addEventListener('click', async () => {
		try {
			const res = await fetch('/logout', {
				method: 'post',
				headers: {
					'Content-Type': 'application/json'
				},
				credentials: 'include'
			});

			if (!res.ok) {
				const errorMessage = await res.text();
				alert(errorMessage);
				return;
			}

			toggle_login();
			update_session();

		} catch (err) {
			console.log(err);
		}
	});

	accountForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		try {
			const formData = new FormData(accountForm);
			const username = formData.get('uname');
			const password = formData.get('psw');

			const data = {
				'username': username,
				'password': password
			};

			const submitter = event.submitter;

			if (submitter.value == 'Login') {
				const res = await fetch('/login', {
					method: 'post',
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

				toggle_login();
				update_session();
			}

			if (submitter.value == 'Create Account') {
				const res = await fetch('/create_user', {
					method: 'post',
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
				console.log('New acconut created with ID: ', id);
				alert('Account created');
			}

		} catch (err) {
			console.log(err);
		}
	});
}

function toggle_login() {
	const login_container = document.getElementById('login-container'); 
	const logout_container = document.getElementById('logout-container'); 
	login_display = login_container.style.display;

	console.log(login_display);
	if (login_display === 'none' || login_display === '') {
		login_container.style.display = 'flex';
		logout_container.style.display = 'none';
	} else {
		login_container.style.display = 'none';
		logout_container.style.display = 'flex';
	}

}

async function update_session(initialLoad = false) {
	const login_container = document.getElementById('login-container'); 
	const logout_container = document.getElementById('logout-container'); 
	const user_info = document.getElementById('user-info');
	try {
		const res = await fetch('/session_info');
		const session = await res.json();
		if (typeof session.username !== 'undefined') {
			user_info.innerHTML = 'Logged in as ' + session.username;
			if (initialLoad) {
				logout_container.style.display = 'flex';			
			}
		} else {
			user_info.innerHTML = 'Not logged in';
			if (initialLoad) {
				login_container.style.display = 'flex';
			}
		}
	} catch (err) {
		console.log(err);
	}
}
