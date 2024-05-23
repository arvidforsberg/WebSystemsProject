window.onload = () => {
	const timerForm = document.getElementById('timer-form');

	timerForm.addEventListener('submit', async (event) => {
		event.preventDefault();

		const formData = new FormData(timerForm);
		const time = formData.get('time');
		const action = formData.get('action');

		const now = new Date();
		const [hours, minutes] = time.split(':').map(Number);
		now.setHours(hours, minutes, 0, 0);

		const utcHours = now.getUTCHours();
		const utcMinutes = now.getUTCMinutes();
		const utcTime = `${utcHours.toString().padStart(2, '0')}:${utcMinutes.toString().padStart(2, '0')}`;

		const data = {
			'time': utcTime,
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
		alert(`Timer set for ${time} with action ${action}`);
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
			const utcTime = timer.time;
			const [hours, minutes] = utcTime.split(':').map(Number);

			const now = new Date();
			const dateUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), hours, minutes));
			const localDate = new Date(dateUTC.toLocaleString());
			const displayTime = localDate.toLocaleTimeString('en-US', {
				hour: '2-digit',
				minute: '2-digit',
				hour12: false
			});

			console.log(`Time: ${displayTime}	Action: ${timer.action}`);
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
