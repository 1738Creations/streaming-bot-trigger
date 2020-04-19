// For connecting to Mixer
const Mixer = require('@mixer/client-node');
const ws = require('ws');

// For writing files
const fs = require('fs');

// Time between triggers in ms, we multiply by 1000 to get seconds
var TimeToPlayNext = 7000;

// This determines if we can play an overlay
// We want a gap so they don't trigger each time, every time or even overlap
var ReadyToPlay = false;

// Hide the last game
HTMLCSSUpdate("hidden", null, "", 0);

// CssVisibility = visible/hidden
// CssImage = index in 
// HtmlAudio = path (sounds/whatever.ogg) or ""
function HTMLCSSUpdate(CssVisibility, CssImage, HtmlAudio, TimeBeforeHidingImage) {

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

	// Start the delay for hiding this, carried in the array
	if (TimeBeforeHidingImage > 0) {
		setTimeout(ImageDisplayTasks, TimeBeforeHidingImage);
	}

	// \END of file write
}


// All the images and audio we want to play
// array of possible images to show, sound, matches required, matches, time to display image (ms)
var ArrayOfStuffToPlay = [
	[['images/dsp.png', 'images/dsp2.png'], 'sounds/the_guy.ogg', 2, ['guy', 'loser'], 2000],
	[['images/webby.png'], 'sounds/webby.ogg', 1, ['leave', 'join'], 1800]
];


// Mixer
// Instantiate a new Mixer Client
// See the Mixer documentation for anything related to their system
// https://dev.mixer.com/
const client = new Mixer.Client(new Mixer.DefaultRequestRunner());

client.use(new Mixer.OAuthProvider(client, {
    tokens: {
        access: <replace_me>, // access: 'xxxj2kdl2j5er4il2rhew3i43lrhlwe423423',
        // Tokens retrieved via this page last for 1 year.
        expires: Date.now() + (365 * 24 * 60 * 60 * 1000)
    },
}));

// Mixer
// Joins the bot to chat
async function joinChat(userId, channelId) {
    const joinInformation = await getConnectionInformation(channelId);
    const socket = new Mixer.Socket(ws, joinInformation.endpoints).boot();
	
	// Set the initial time out before anything triggers
	setTimeout(TimeBeforeNextCanBeTriggered, TimeToPlayNext);
	console.log("Trigger warning online");

    return socket.auth(channelId, userId, joinInformation.authkey).then(() => socket);
}

// Mixer
// Returns body response of bot joining chat
async function getConnectionInformation(channelId) {
    return new Mixer.ChatService(client).join(channelId).then(response => response.body);
}

// Mixer
// ...gets details about users in chat
async function getUserInfo() {
    return client.request('GET', 'users/current').then(response => response.body);
}


// No Mixer functions below this lineHeight
// ------------------------------------


// Start the bot / join it to chat
getUserInfo().then(async userInfo => {
	// The ID of the channel  to join specific channel and verify users messaging the bot are in this channel
	const targetChannelID = <replace_me>; // example: targetChannelID = 123456789

	// Joins the bot to the channel
	const socket = await joinChat(userInfo.id, targetChannelID);
	
    // Looks for any chat message (main chat, whispers...)
	// For this game we don't care if people spam main chat with the command, if we did we'd force the bot to only listen for whispers
	// -- data.message.meta[0].whisper == true)
	// -- https://dev.mixer.com/reference/chat/events/chatmessage
    socket.on('ChatMessage', data => {

	if (ReadyToPlay == true) {
		
			// If the message has contents we can read
			if (data.message.message[0].data)
			{
				// Set the message body. Trim it too
				var MessageText = data.message.message[0].data.toLowerCase().trim();
				
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
					HTMLCSSUpdate('visible', ImageToPlay, SoundToPlay, TimeToDisplayImage);
				}

			}
		}
	});

    // Handle errors
    socket.on('error', error => {
        console.error('Socket error');
        console.error(error);
    });
});


// This is the time to display the image
function ImageDisplayTasks() {
	// Set the css to hidden
	HTMLCSSUpdate('hidden', null, "", 0);
	
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