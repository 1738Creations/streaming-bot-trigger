// For connecting to Twitch
const tmi = require('tmi.js');

// For writing files
const fs = require('fs');

// Time between triggers in ms, we multiply by 1000 to get seconds
var TimeToPlayNext = 7000;

// This determines if we can play an overlay
// We want a gap so they don't trigger each time, every time or even overlap
var ReadyToPlay = false;

// Hide the last game
HTMLCSSUpdate("hidden", null, "");

// CssVisibility = visible/hidden
// CssImage = index in 
// HtmlAudio = path (sounds/whatever.ogg) or ""
function HTMLCSSUpdate(CssVisibility, CssImage, HtmlAudio) {

	// First we need to write the HTML, this is not update checked by the js
	try {
		var data = fs.readFileSync('child.html', 'utf8');
	} catch(e) {
		console.log('Error:', e.stack);
	}

	// Pull out the data we don't want to change, stripping out existing answers and questions
	var HTMLVisibilityBefore = data.substring(0, (data.lastIndexOf("<!--snd-->")+10));
	var HTMLVisibilityAfter = data.substring(data.lastIndexOf("<!--/snd-->"), data.length);

	// Build the HTML output, inserting our questions and answers
	var CompiledHTMLData = HTMLVisibilityBefore + '<audio id="AudioToPlay" autoplay="autoplay" src="' + HtmlAudio + '"></audio>' + HTMLVisibilityAfter;

	// Write the HTML with our compiled data
	fs.writeFileSync('child.html', CompiledHTMLData, (err) => {
	if (err) throw err;
		console.log('Error writing to file.');
		console.log(err);
	});

	// Now we update the CSS
	try {
		var data = fs.readFileSync('child.css', 'utf8');
	} catch(e) {
		console.log('Error:', e.stack);
	}
	
	if (CssImage == null)
	{
		// Pull out the data we don't want to change, stripping out existing answers and questions
		var CssVisibilityBefore = data.substring(0, (data.lastIndexOf("/*mvis*/")+8));
		var CssVisibilityAfter = data.substring(data.lastIndexOf("/*/mvis*/"), data.length);

		// Build the HTML output, inserting our questions and answers
		var CompiledCSSData = CssVisibilityBefore + CssVisibility + CssVisibilityAfter;
	}
	else
	{
		// Pull out the data we don't want to change, stripping out existing answers and questions
		var CssVisibilityBefore = data.substring(0, (data.lastIndexOf("/*mvis*/")+8));
		var CssURLBefore = data.substring(data.lastIndexOf("/*/mvis*/"), (data.lastIndexOf("/*i-add*/")+9));
		var CssURLAfter = data.substring(data.lastIndexOf("/*/i-add*/"), data.length);

		// Build the HTML output, inserting our questions and answers
		var CompiledCSSData = CssVisibilityBefore + CssVisibility + CssURLBefore + "url(\"" + CssImage + "\")" + CssURLAfter;
	}

	// Write the CSS with our compiled data
	fs.writeFileSync('child.css', CompiledCSSData, (err) => {
	if (err) throw err;
		console.log('Error writing to file.');
		console.log(err);
	});
	// \END of file write
}


// All the images and audio we want to play
// array of possible images to show, sound, matches required, matches, time to display image (ms)
var ArrayOfStuffToPlay = [
	[['images/dsp.png', 'images/dsp2.png'], 'sounds/the_guy.ogg', 2, ['guy', 'loser'], 2300],
	[['images/webby.png'], 'sounds/webby.ogg', 1, ['leave', 'join'], 2000]
];


// Twitch
// Define configuration options
const opts = {
	identity: {
		username: <replace_me>, // Name of the bot account, example: username: 'accountname'
		password: <replace_me> // Auth token of the bot account, example: password: 'oauth:4seeee33535ewer35tewrw334'
	},
	channels: [
		<replace_me> // Name of channel to join, example: 'channel_name'
	]
}

// Twitch
// Create a client with our options
const client = new tmi.client(opts);

// Twitch
// Register our event handlers (defined below)
client.on('connected', onConnectedHandler);
client.on('message', onMessageHandler);
// Twitch won't allow 'new' (I've been registered for 3 days and can't whisper) users to whisper, so this ruins the game and users have to spam chat
//client.on('whisper', onWhisperHandler);

// Twitch
// Connect the bot to Twitch
client.connect();


// No Twitch functions below this lineHeight
// ------------------------------------


// As noted above when declaring this listener, we can't reliably handle whispers on Twitch...
//function onWhisperHandler() {
	// Do stuff here...
//}


// Received a message. This event is fired whenever you receive a chat, action or whisper message
function onMessageHandler (channel, userstate, msg, self) {

	// No point going any further if we're in a break
	if (ReadyToPlay == true) {

		// Ignore messages from the bot, which shouldn't be an issue but calling it regardless
		if (self)
		{ return; }

		//As we can't reliably handle whispers in Twitch, we're don't need to check whether users are in the same channel

		// We're going to check the type of message - we only care about general chat messages
		switch(userstate["message-type"])
		{
			case "action":
				// This is an action message..
				break;

			case "chat":
				// Set the message body. Trim it too
				var MessageText = msg.toLowerCase().trim();
				
				// If this is greater than -1 we can cut the array and trigger a play
				var ImageToPlay = "";
				var SoundToPlay = "";
				var TimeToDisplayImage = 0;

				// Loop through each item in the array and check if it matches anything in chat
				for (const [index, content] of ArrayOfStuffToPlay.entries()) {
					// Pull the text strings to match from the array index
					var ArrayOfLocalText = content[3];
					
					// The number of matches required
					var NumberOfMatchesRequired = content[2];
					var MatchesMet = 0;
					
					// Iterate through the list of single local strings
					for (const [secondIndex, secondContent] of ArrayOfLocalText.entries()) {
						// Check if the local string matches anything in the chat message

						if (MessageText.includes(secondContent.toLowerCase()) == true) {
							// Increases number of matches
							MatchesMet += 1;
							
							if (MatchesMet == NumberOfMatchesRequired) {
								// Set blocker flag
								ReadyToPlay = false;

								// Pull out a random image from the array
								var RandomImageToShow = randomIntFromInterval(1, content[0].length) - 1;
								
								// Set the image
								ImageToPlay = content[0][RandomImageToShow];
								
								// Set the sound
								SoundToPlay = content[1];
								
								// Set the image display length
								TimeToDisplayImage = content[4];
								break;
							}
						}
					}
					
					if (ReadyToPlay == false) {
						break;
					}
				}
				
				// A match was found
				if (ReadyToPlay == false) {	
					// Update CSS (for visibility control)
					HTMLCSSUpdate('visible', ImageToPlay, SoundToPlay);

					// Start the delay for hiding this, carried in the array
					setTimeout(ImageDisplayTasks, TimeToDisplayImage);
				}

				break;
				
			case "whisper":
				// We can also handle whispers here, but we don't care about them
				break;
				
			default:
				// Should never get here
				console.log("Unknown command message - should never get here");
				break;
		}
    }
}


// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
	// Starts the game
	// (function, time before game starts in ms, joinChat)
	// ...if set too low (less than a second) it may not fire the initial chat message as the bot can take a while to join chat

	setTimeout(TimeBeforeNextCanBeTriggered, TimeToPlayNext);

	// Logging that we're online
	console.log("Trigger warning online");
}


// This is the time to display the image
function ImageDisplayTasks() {
	// Set the css to hidden
	HTMLCSSUpdate('hidden', null, "");
	
	// Set the start of the next trigger after this amount of time
	setTimeout(TimeBeforeNextCanBeTriggered, TimeToPlayNext);
}


// This just sets a flag for enabling the content again
function TimeBeforeNextCanBeTriggered() {
	console.log('Ready to trigger');
	ReadyToPlay = true;
}


// Random value between 2 numbers (*1000 for milliseconds)
function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}