## How We Solved the Local TTS 404 Bug (React + FastAPI)

### Problem
- The frontend (React) was sending TTS requests to `/api/tts` on port 3000, but the FastAPI backend was running on port 8000.
- This resulted in 404 errors and the message "TTS service is unavailable" in the UI.

### Solution Steps
1. **Verified Backend Health**
  - Confirmed FastAPI was running and `/api/tts` worked via:
    ```bash
    curl -X POST http://127.0.0.1:8000/api/tts -H "Content-Type: application/json" -d '{"text":"Hello"}'
    ```
  - Got a valid response: `{"audio_url": "/static/audio/..."}`

2. **Checked Frontend API Calls**
  - Found that `ttsService.js` was using a same-origin API path (`/api/tts`), which only works if a proxy is set in `package.json`.
  - No proxy was set in `web-frontend/webfront/package.json`.

3. **Fixed the API URL in Frontend**
  - Edited `web-frontend/webfront/src/utils/ttsService.js`:
    ```js
    // Old:
    // const API_URL = (typeof window !== 'undefined' && window.location && window.location.origin)
    //   ? `${window.location.origin}/api/tts`
    //   : `http://localhost:8000/api/tts`;

    // New:
    const API_URL = 'http://localhost:8000/api/tts';
    ```

4. **Removed Unused Variables**
  - Cleaned up unused `ORIGIN_FALLBACK` and related code to fix ESLint errors.

5. **Restarted Frontend**
  - Ran `npm start` in the frontend directory.

6. **Tested Again**
  - The TTS button worked, and the error message disappeared.

### Key Takeaways
- For local development, always point your frontend API calls directly to the backend port if you don't use a proxy.
- In production, you can use same-origin paths if your frontend and backend are served behind the same domain (e.g., via nginx).

---
**This guide documents the fix for the TTS 404 bug in local development.**
Your FastAPI backend is running and the OpenAI response is working, but pyttsx3 failed to create the TTS output file:

```
ERROR:app.tts_service:TTS output file was not created: static/audio/output_20250930_140725_f12ffa09.wav
```

**This means:**
- pyttsx3 did not generate the audio file.
- The fallback to gTTS was not triggered (or also failed).
- The frontend TTS button stays loading because the backend did not return a valid audio URL.

---

### Troubleshooting steps:

1. **Check pyttsx3 installation and dependencies:**
   - Is pyttsx3 installed in your venv?
   - Is the required TTS engine (e.g., eSpeak for Linux) installed on your system?

   ```bash
   pip show pyttsx3
   which espeak
   espeak "test"
   ```

2. **Check for permission issues:**
   - Does the backend process have write access to `static/audio/`?

   ```bash
   ls -ld static/audio
   ls -l static/audio
   ```

3. **Force gTTS fallback:**
   - Temporarily disable pyttsx3 in your code to see if gTTS works.

4. **Check backend logs for gTTS errors if fallback is triggered.**

---

### Next actions:

- Run the above commands to check pyttsx3 and eSpeak.
- If `espeak` is missing, install it:

  ```bash
  sudo apt-get update
  sudo apt-get install espeak
  ```

- If permissions are wrong, fix them:

  ```bash
  chmod -R 755 static/audio
  ```

---

**Summary:**  
- The error is with local TTS file generation (pyttsx3 or system TTS).
- Check dependencies and permissions.
- If you want, I can show you how to force gTTS fallback for testing.

Let me know the results of these checks!




ackend/realestate_agent$ pip show pyttsx3
which espeak
espeak "test"
Name: pyttsx3
Version: 2.99
Summary: Text to Speech (TTS) library for Python 3. Works without internet connection or delay. Supports multiple TTS engines, including Sapi5, nsss, and espeak.
Home-page: https://github.com/nateshmbhat/pyttsx3
Author: 
Author-email: Natesh M Bhat <nateshmbhatofficial@gmail.com>
License-Expression: MPL-2.0
Location: /home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/venv/lib/python3.11/site-packages
Requires: 
Required-by: 
Command 'espeak' not found, but can be installed with:
sudo apt install espeak            # version 1.48.15+dfsg-3, or
sudo apt install espeak-ng-espeak  # version 1.51+dfsg-12
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ 


You are running into command errors because `espeak` is not installed via snap, but via apt.

**To install espeak on Ubuntu, use:**
```bash
sudo apt-get update
sudo apt-get install espeak
```

After installing, test it:
```bash
espeak "test"
```

Once `espeak` works, restart your backend and test TTS again.  
This should resolve the pyttsx3 file creation issue and allow your TTS service to work.

Let me know if you need further help!


(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ sudo apt-get update
sudo apt-get install espeak
Reading package lists... Done
E: Could not get lock /var/lib/apt/lists/lock. It is held by process 25994 (aptd)
N: Be aware that removing the lock file is not a solution and may break your system.
E: Unable to lock directory /var/lib/apt/lists/
E: Could not get lock /var/lib/dpkg/lock-frontend. It is held by process 25994 (aptd)
N: Be aware that removing the lock file is not a solution and may break your system.
E: Unable to acquire the dpkg frontend lock (/var/lib/dpkg/lock-frontend), is another process using it?





(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ sudo apt-get update
sudo apt-get install espeak
Hit:1 http://eg.archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://security.ubuntu.com/ubuntu noble-security InRelease                                                
Hit:3 https://download.docker.com/linux/ubuntu noble InRelease                                                  
Get:4 https://nvidia.github.io/libnvidia-container/stable/deb/amd64  InRelease [1,477 B]                        
Hit:5 http://eg.archive.ubuntu.com/ubuntu noble-updates InRelease                                               
Hit:6 https://dl.winehq.org/wine-builds/ubuntu noble InRelease                                                  
Get:7 https://nvidia.github.io/libnvidia-container/stable/ubuntu18.04/amd64  InRelease [1,484 B]                
Hit:9 https://dl.google.com/linux/chrome/deb stable InRelease                                                   
Hit:10 http://eg.archive.ubuntu.com/ubuntu noble-backports InRelease                                            
Hit:11 https://ppa.launchpadcontent.net/deadsnakes/ppa/ubuntu noble InRelease                                   
Hit:12 https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble InRelease                                       
Hit:13 https://windsurf-stable.codeiumdata.com/wVxQEIWkwPUEAGf3/apt stable InRelease                     
Ign:14 https://download.sublimetext.com apt InRelease                                             
Err:15 https://download.sublimetext.com apt Release                         
  404  Not Found [IP: 104.236.0.104 443]
Hit:8 https://hub-dist.unity3d.com/artifactory/hub-debian-prod-local stable InRelease
Reading package lists... Done
E: The repository 'https://download.sublimetext.com apt Release' does not have a Release file.
N: Updating from such a repository can't be done securely, and is therefore disabled by default.
N: See apt-secure(8) manpage for repository creation and user configuration details.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following additional packages will be installed:
  espeak-data libespeak1 libportaudio2
The following NEW packages will be installed:
  espeak espeak-data libespeak1 libportaudio2
0 upgraded, 4 newly installed, 0 to remove and 5 not upgraded.
Need to get 1,360 kB of archives.
After this operation, 3,127 kB of additional disk space will be used.
Do you want to continue? [Y/n] y
Get:1 http://eg.archive.ubuntu.com/ubuntu noble/universe amd64 libportaudio2 amd64 19.6.0-1.2build3 [67.9 kB]
Get:2 http://eg.archive.ubuntu.com/ubuntu noble/universe amd64 espeak-data amd64 1.48.15+dfsg-3build1 [1,070 kB]
Get:3 http://eg.archive.ubuntu.com/ubuntu noble/universe amd64 libespeak1 amd64 1.48.15+dfsg-3build1 [159 kB]
Get:4 http://eg.archive.ubuntu.com/ubuntu noble/universe amd64 espeak amd64 1.48.15+dfsg-3build1 [63.3 kB]
Fetched 1,360 kB in 2s (705 kB/s)    
Selecting previously unselected package libportaudio2:amd64.
(Reading database ... 269747 files and directories currently installed.)
Preparing to unpack .../libportaudio2_19.6.0-1.2build3_amd64.deb ...
Unpacking libportaudio2:amd64 (19.6.0-1.2build3) ...
Selecting previously unselected package espeak-data:amd64.
Preparing to unpack .../espeak-data_1.48.15+dfsg-3build1_amd64.deb ...
Unpacking espeak-data:amd64 (1.48.15+dfsg-3build1) ...
Selecting previously unselected package libespeak1:amd64.
Preparing to unpack .../libespeak1_1.48.15+dfsg-3build1_amd64.deb ...
Unpacking libespeak1:amd64 (1.48.15+dfsg-3build1) ...
Selecting previously unselected package espeak.
Preparing to unpack .../espeak_1.48.15+dfsg-3build1_amd64.deb ...
Unpacking espeak (1.48.15+dfsg-3build1) ...
Setting up libportaudio2:amd64 (19.6.0-1.2build3) ...
Setting up espeak-data:amd64 (1.48.15+dfsg-3build1) ...
Setting up libespeak1:amd64 (1.48.15+dfsg-3build1) ...
Setting up espeak (1.48.15+dfsg-3build1) ...
Processing triggers for man-db (2.12.0-4build2) ...
Processing triggers for libc-bin (2.39-0ubuntu8.6) ...
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ 


(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ espeak "test"









################################################################################################
############################################################################



Console dev tools


react-dom-client.development.js:24870 Download the React DevTools for a better development experience: https://react.dev/link/react-devtools
ChromeSpeechRecognition.js:78 Speech recognition initialized.
SpeakChat.js:27 Warming up TTS service...
ttsService.js:29 Sending TTS request for text: Hello
ChromeSpeechRecognition.js:83 Cleaning up speech recognition
ChromeSpeechRecognition.js:78 Speech recognition initialized.
SpeakChat.js:27 Warming up TTS service...
ttsService.js:29 Sending TTS request for text: Hello
api/tts:1  Failed to load resource: the server responded with a status of 404 (Not Found)
ttsService.js:39 TTS response: <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/tts</pre>
</body>
</html>

ttsService.js:42 Full TTS response: <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/tts</pre>
</body>
</html>

ttsService.js:53 No audio URL in response from TTS service: <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/tts</pre>
</body>
</html>

textToSpeech @ ttsService.js:53
ttsService.js:92 TTS Error: Error: No audio URL in response from TTS service
    at TTSService.textToSpeech (ttsService.js:54:1)
    at async warmUpTts (SpeakChat.js:30:1)
textToSpeech @ ttsService.js:92
api/tts:1  Failed to load resource: the server responded with a status of 404 (Not Found)
ttsService.js:39 TTS response: <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/tts</pre>
</body>
</html>

ttsService.js:42 Full TTS response: <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/tts</pre>
</body>
</html>

ttsService.js:53 No audio URL in response from TTS service: <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Error</title>
</head>
<body>
<pre>Cannot POST /api/tts</pre>
</body>
</html>

textToSpeech @ ttsService.js:53
ttsService.js:92 TTS Error: Error: No audio URL in response from TTS service
    at TTSService.textToSpeech (ttsService.js:54:1)
    at async warmUpTts (SpeakChat.js:30:1)
textToSpeech @ ttsService.js:92
SpeakChat.js:37 TTS service warm-up failed: Error: TTS failed: No audio URL in response from TTS service
    at TTSService.textToSpeech (ttsService.js:104:1)
    at async warmUpTts (SpeakChat.js:30:1)
warmUpTts @ SpeakChat.js:37
