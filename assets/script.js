window.onload = () => {
	updateStatus();

	var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
	const recognition = new SpeechRecognition();

	const toggle_btn = document.getElementById('toggle-button');
	const mic_btn = document.getElementById('mic-button');

	toggle_btn.addEventListener('click', async () => {
		try {
			const cur_status = await updateStatus();
			const res = await fetch('/switch', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					'id': 1,
					'state': (cur_status ? 0 : 1)
				})
			});

			if (!res.ok) {
				const errorMessage = await res.text();
				alert(errorMessage);
				return;
			}

			await updateStatus();
		} catch (err) {
			console.log(err);	
		}
	});

	mic_btn.addEventListener('click', () => {
		recognition.start();
	});
	
	recognition.onresult = async (event) => {
		const last = event.results.length - 1;
		const command = event.results[last][0].transcript;

		console.log('Voice command: ', command);

		try {
			const res = await fetch('/voice_command', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					command: command.trim().toLowerCase(),
					id: 1
				})
			});

			if (!res.ok) {
				const errorMessage = await res.text();
				alert(errorMessage);
				return;
			}
			
			await updateStatus();
		} catch (err) {
			console.log(err);
		}
	};
}

async function updateStatus() {
	const light_circle = document.getElementById("lightCircle");

	try {
		const res = await fetch('/switch');
		const cur_status = await res.json();
		
		if (cur_status == 1) {
			light_circle.style.borderColor = 'green';
			light_circle.style.boxShadow = '0 0 20px green';
		} else {
			light_circle.style.borderColor = 'red';
			light_circle.style.boxShadow = '0 0 20px red';
		}

		return cur_status;
	} catch (err) {
		console.log(err);
		return -1;
	}
}
/*
function toggleLight() {
  var circle = document.getElementById("lightCircle");
  if (circle.style.borderColor === "green") {
    circle.style.borderColor = "red";
    circle.style.boxShadow = "0 0 20px red";
  } else {
    circle.style.borderColor = "green";
    circle.style.boxShadow = "0 0 20px green";
  }
}
*/
function toggleLightDarkMode() {
  var body = document.body;
  if (body.classList.contains("w3-black")) {
	body.classList.remove("w3-black", "dark-mode");
    body.classList.add("w3-white", "light-mode");
  } else {
    body.classList.remove("w3-white", "light-mode");
    body.classList.add("w3-black", "dark-mode");
  }
}
/*
function toggleVoiceControl() {
  var body = document.body;
  body.classList.toggle("voice-control-enabled");
}
*/

