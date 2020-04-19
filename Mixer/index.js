// We'll check for updated data every half second since it doesn't take many resources

// For verifying CSS changes
var PreviousCSSBody = "";

// Declare the iframe, we'll find it in the dom on the page load function
var iframe = "";
var myAudio = "";
var RefreshTime = 1500;


function DoOnPageLoad() {
	// Get the iframe location for refreshing later
	iframe = document.getElementById('TheIframe');

	// Trigger the CSS updates
	RefreshCSS();
}


// We'll wait for the audio to stop playing before triggering a refresh
function IsAudioPlaying() {
	myAudio = iframe.contentWindow.document.getElementById('AudioToPlay');
	if (myAudio.duration > 0 && !myAudio.paused) {
		return(true);
	} else {
		return(false);
	}
}


// Should add a verification for if the iframe has loaded, but good for a demo
function RefreshCSS() {
	var promise = Promise.resolve();
	promise = promise.then(fetch('child.css', {mode: 'no-cors'})
		.then(res => res.text())
		.then((data) => {
			if (data != PreviousCSSBody) {
				// If the audio isn't playing, we'll refresh the page
				if (IsAudioPlaying() == false) {
					// Reload the iframe
					iframe.src = iframe.src;
					RefreshTime = 1500;

					// Sets the old data to current for checking on the next loop!
					PreviousCSSBody = data;
				}
				{
					RefreshTime = 250;
				}
			}
		})
	 )

	promise.then(function(response){
		setTimeout(RefreshCSS, RefreshTime);
	});
}