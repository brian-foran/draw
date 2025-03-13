// Function to load video URLs and titles from env.json
async function loadVideo() {
    const timestamp = new Date().getTime();  // Get the current timestamp
    const response = await fetch(`env.json?t=${timestamp}`);  // Append the timestamp to the URL
    const data = await response.json();
    document.getElementById('videoPlayer1').src = data.video_1.video_url;
    document.getElementById('videoTitle1').innerText = data.video_1.video_topic;
    document.getElementById('videoPlayer2').src = data.video_2.video_url;
    document.getElementById('videoTitle2').innerText = data.video_2.video_topic;
    document.getElementById('videoPlayer3').src = data.video_3.video_url;
    document.getElementById('videoTitle3').innerText = data.video_3.video_topic;
    document.getElementById('videoPlayer4').src = data.video_4.video_url;
    document.getElementById('videoTitle4').innerText = data.video_4.video_topic;
}
loadVideo();

// Function to check CNC status from Particle Photon cloud
async function checkCNCStatus(token) {
    const particle = new Particle();
    const deviceId = '29003a000a47363339343638';
    try {
        const data = await particle.getVariable({ deviceId: deviceId, name: 'cnc_active_flag', auth: token });
        console.log('CNC status:', data.body);
        if (data.body.result == 1) {
            document.getElementById('CNCActiveMessage').style.display = 'block';
            return true;
        } else {
            document.getElementById('CNCActiveMessage').style.display = 'none';
            return false;
        }
    } catch (error) {
        console.error('Error getting CNC status:', error);
        return false;
    }
}

// Event listener for form submission
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('drawForm').addEventListener('submit', async function(event) {
        event.preventDefault();
        console.log('Function running');
        var message = document.getElementById('message').value.replaceAll(" ", '_');
        var token = document.getElementById('token').value;

        var particle = new Particle();
        var deviceId = '29003a000a47363339343638';
        var functionName = 'triggerCNC';

        // Hide all messages and show loading message
        document.getElementById('loadMessage').style.display = 'block';
        document.getElementById('successMessage').style.display = 'none';
        document.getElementById('ParticleErrorMessage').style.display = 'none';
        document.getElementById('CNCActiveMessage').style.display = 'none';
        document.getElementById('DailyLimitMessage').style.display = 'none';
        document.getElementById('ServerErrorMessage').style.display = 'none';

        // Check CNC status before making the function call
        let cnc_active = await checkCNCStatus(token);
        console.log('CNC active:', cnc_active);
        
        if (!cnc_active) {
            particle.callFunction({ deviceId: deviceId, name: functionName, argument: message, auth: token }).then(
                function(data) {
                    console.log('response type', typeof data);
                    console.log('Function called successfully:', data.body.return_value);

                    // Display appropriate message based on return value
                    if (data.body.return_value == 1) {
                        document.getElementById('successMessage').style.display = 'block';
                    }
                    else if (data.body.return_value == 0) {
                        document.getElementById('ServerErrorMessage').style.display = 'block';
                    }
                    else if (data.body.return_value == -1) {
                        document.getElementById('DailyLimitMessage').style.display = 'block';
                    }
                    document.getElementById('ParticleErrorMessage').style.display = 'none';
                },
                function(err) {
                    console.log('An error occurred:', err);
                    document.getElementById('successMessage').style.display = 'none';
                    document.getElementById('ParticleErrorMessage').style.display = 'block';
                }
            ).finally(function() {
                document.getElementById('loadMessage').style.display = 'none';
            });
        } else {
            document.getElementById('loadMessage').style.display = 'none';
        }
    });

    // Check CNC status on page load if token is provided
    const token = document.getElementById('token').value;
    if (token) {
        checkCNCStatus(token);
    }
});