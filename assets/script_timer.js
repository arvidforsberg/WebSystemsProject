window.onload = () => {
	const timerForm = document.getElementById('timer-form');

	timerForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const formData = new FormData(timerForm);
		const time = formData.get('time');
		const action = formData.get('action');
		const data = {
			'time': time,
			'action': action
		};

		const res = await fetch('/timer', {
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

		const timerText = await res.text();
		alert(timerText);
	});

	const activeTimersBtn = document.getElementById('active-timers-btn');

	activeTimersBtn.addEventListener('click', async () => {
		const res = await fetch('/active_timers');
		const timers = await res.json();

		if (timers.length === 0) { 
			console.log('No active timers');
		} else {
			console.log('Active timers:');
		}

		timers.forEach(timer => {
			console.log(`Time: ${timer.time}	Action: ${timer.action}`);
		});
	});

	const clearTimersBtn = document.getElementById('clear-timers-btn');

	clearTimersBtn.addEventListener('click', async () => {
		const res = await fetch('/clear_timers', {
			method: 'post'
		});

		const clearText = await res.text();
		alert(clearText);
	});
}
