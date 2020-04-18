Streaming Bot - Trigger
=======================
Trigger? Triggered? One of those. This one looks for specific terms in chat then triggers an image and audio combination in a HTML page. Link that page in OBS and you've got a simple overlay. Requires a web server (local) due to the JS requirements.

I KNOW... that dynamically updating the HTML and CSS in the way I have is very bad. It was the simplest way I could think of without using a ton of external libraries. The idea is to keep these bots simple so an average streamer can figure them out.


LEGAL STUFF:
============
You do not have permission to use or modify any of the content in this reprository if...

...you are an e-beggar, tit streamer or someone who can't be bothered to try at real job and provide some worth to society. If you're the kind of person who is featured on the Mixer homepage then this is not for you. If you spend your time in the 'just chatting' portion of Twitch or have a pre-stream, this is not for you.

If in doubt, mail me with a link to verify your societal status.

If this breaks something or you get banned for using it, that's your problem not mine.


REQUIREMENTS:
=============
Each scripts is intended to run from an account, either Twitch or Mixer. You can create a new account or use your host account.

Scripts can be run from any machine. They don't need to be on the hosting computer and should work on Windows or Linux as they're Node.js scripts.


MIXER:
======
It's assumed users have followed the installation on the dev sites...
Ref: https://dev.mixer.com/guides/chat/introduction
Ref: https://dev.mixer.com/guides/chat/chatbot

Search the script for '<replace_me>' and replace the details as they're found:

- access: <replace_me>,
-- This can be found on the '/chatbot' link above by clicking the link in the matching code (simplest way of finding it)

- const targetChannelID = <replace_me>
-- This can be found: https://mixer.com/api/v1/channels/<channel_name>?fields=id
-- Obviously change 'channel_name' to the name of the channel you want to join

Run the script: node trigger_mixer.js


TWITCH:
=======
It's assumed users have followed the installation on the dev sites...
Ref: https://dev.mixer.com/guides/chat/introduction

Search the script for '<replace_me>' and replace the details as they're found:

- username: <replace_me>
-- Name of the bot account

- password: <replace_me>
-- When logged in to the Twitch bot account, go to this page and connect:
--- https://twitchapps.com/tmi/
-- The entire string: 'oauth:oauth:jnmki23o9278h4kjhe9w843vew9ewaa7'

- channels: [ <replace_me> ]
-- Name of the channel to join as it appears in a browser such as: https://www.mixer.com/replace_me

Run the script: node trigger_twitch.js


CONFIGURATION:
==============
The landing page is 'index.html', which loads 'child.html' in an iframe set with in-line styling. The child page is the one which is refreshed, containing the audio and graphics we have on stream.

You need to add custom items to 'ArrayOfStuffToPlay'. The indexes are:
- Array of images
  - Can have multiple images, one will be selected at random
- The sound to play
  - Only have one here as the length the image is played should be linked to the sound
- How many matches to make before triggering event
  - Integer
- Array of strings we want to match ('include') in the chat message
- Time to display image in milliseconds
  - It's actually the time to refresh the page, but the image and sound will be removed on refresh
  
 ...for example: [['images/dsp.png', 'images/dsp2.png'], 'sounds/the_guy.ogg', 2, ['guy', 'loser'], 2300],

This version has to be run from a web server. If not, the local files won't be picked up and the page will never refresh. I use XAMPP. It couldn't be easier to set up. Download, run installer, start server, go to localhost, done.
- https://www.apachefriends.org/download.html

Not particularly accurate in terms of timing, but good enough.


LIVE DEMO:
==========
Available on request. I have a Mixer and Twitch demo channel used for developing and testing stream tools:
- https://mixer.com/1738_Creations
- https://www.twitch.tv/1738_creations

...the bots only run when I stream. If you'd like a demo then send a request (1738creations@gmail.com) with the stream name and I'll set them up. My scripts are customised to run a South Park Chinpokomon style game.



======================

Shout out Sean Ranklin

Pig-ups Liquid Richard.


Covid19 isn't a threat. The numbers don't lie, people do. Stop using social media and supporting mainstream fake news. The WHO are corrupt.
