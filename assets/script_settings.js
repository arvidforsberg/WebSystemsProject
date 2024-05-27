window.onload = () => {
	const deleteUserForm = document.getElementById('delete-user-form');

	deleteUserForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const formData = new FormData(deleteUserForm);
		const data = {
			'username': formData.get('username')
		};
		
		const res = await fetch('/delete_user', {
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

		const resMessage = await res.text();
		alert(resMessage);
	});
}
