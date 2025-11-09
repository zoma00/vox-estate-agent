
7 directories, 3 files
root@host:~# cd /path/to/your/project/backend/realestate_agent
-bash: cd: /path/to/your/project/backend/realestate_agent: No such file or directory
root@host:~# ls
app.autotechai.bak.2025-09-29T20:33:16+00:00
app.autotechai.bak.2025-09-29T20:34:17+00:00
app.autotechai.bak.2025-09-29T20:35:49+00:00
snap
root@host:~# find / -type d -name "realestate_agent" 2>/dev/null
/opt/vox-estate-agent/backend/realestate_agent





root@host:~# find / -type d -name "realestate_agent" 2>/dev/null
/opt/vox-estate-agent/backend/realestate_agent
root@host:~# /opt/vox-estate-agent/
-bash: /opt/vox-estate-agent/: Is a directory
root@host:~# cd /opt/vox-estate-agent/
root@host:/opt/vox-estate-agent# ls
 Tips                        deploy            package-lock.json   tools
'UI changes both gallery '   docs              package.json        venv
 backend                     mobile-frontend   scripts             web-frontend
root@host:/opt/vox-estate-agent# cd backend/realestate_agent/
root@host:/opt/vox-estate-agent/backend/realestate_agent# ls
LICENSE             app.log        generate_avatar.py  scripts  tts
agent_pipeline.log  audio_output   ollama_llm.py       static   utils
app                 cli_avatar.py  requirements.txt    temp
root@host:/opt/vox-estate-agent/backend/realestate_agent# 






root@host:/opt/vox-estate-agent/backend/realestate_agent# python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
Collecting fastapi>=0.68.0
  Downloading fastapi-0.118.0-py3-none-any.whl (97 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 97.7/97.7 KB 6.6 MB/s eta 0:00:00
Collecting uvicorn>=0.15.0
  Downloading uvicorn-0.37.0-py3-none-any.whl (67 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 68.0/68.0 KB 8.5 MB/s eta 0:00:00
Collecting requests>=2.26.0
  Downloading requests-2.32.5-py3-none-any.whl (64 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 64.7/64.7 KB 9.8 MB/s eta 0:00:00
Collecting transformers<4.50
  Downloading transformers-4.49.0-py3-none-any.whl (10.0 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 10.0/10.0 MB 18.8 MB/s eta 0:00:00
Collecting nltk>=3.8.1
  Downloading nltk-3.9.1-py3-none-any.whl (1.5 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 1.5/1.5 MB 18.0 MB/s eta 0:00:00
Collecting pyttsx3>=2.90
  Downloading pyttsx3-2.99-py3-none-any.whl (32 kB)
Collecting python-multipart>=0.0.5
  Downloading python_multipart-0.0.20-py3-none-any.whl (24 kB)
Collecting python-dotenv>=0.19.0
  Downloading python_dotenv-1.1.1-py3-none-any.whl (20 kB)
Collecting pydantic>=1.8.0
  Downloading pydantic-2.11.9-py3-none-any.whl (444 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 444.9/444.9 KB 17.4 MB/s eta 0:00:00
Collecting typing-extensions>=4.8.0
  Downloading typing_extensions-4.15.0-py3-none-any.whl (44 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 44.6/44.6 KB 6.4 MB/s eta 0:00:00
Collecting starlette<0.49.0,>=0.40.0
  Downloading starlette-0.48.0-py3-none-any.whl (73 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 73.7/73.7 KB 11.2 MB/s eta 0:00:00
Collecting click>=7.0
  Downloading click-8.3.0-py3-none-any.whl (107 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 107.3/107.3 KB 18.2 MB/s eta 0:00:00
Collecting h11>=0.8
  Downloading h11-0.16.0-py3-none-any.whl (37 kB)
Collecting idna<4,>=2.5
  Downloading idna-3.10-py3-none-any.whl (70 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 70.4/70.4 KB 8.0 MB/s eta 0:00:00
Collecting charset_normalizer<4,>=2
  Downloading charset_normalizer-3.4.3-cp310-cp310-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (152 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 152.4/152.4 KB 13.6 MB/s eta 0:00:00
Collecting urllib3<3,>=1.21.1
  Downloading urllib3-2.5.0-py3-none-any.whl (129 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 129.8/129.8 KB 3.3 MB/s eta 0:00:00
Collecting certifi>=2017.4.17
  Downloading certifi-2025.8.3-py3-none-any.whl (161 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 161.2/161.2 KB 15.5 MB/s eta 0:00:00
Collecting tokenizers<0.22,>=0.21
  Downloading tokenizers-0.21.4-cp39-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (3.1 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3.1/3.1 MB 18.5 MB/s eta 0:00:00
Collecting safetensors>=0.4.1
  Downloading safetensors-0.6.2-cp38-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (485 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 485.8/485.8 KB 19.2 MB/s eta 0:00:00
Collecting huggingface-hub<1.0,>=0.26.0
  Downloading huggingface_hub-0.35.3-py3-none-any.whl (564 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 564.3/564.3 KB 17.6 MB/s eta 0:00:00
Collecting tqdm>=4.27
  Downloading tqdm-4.67.1-py3-none-any.whl (78 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 78.5/78.5 KB 12.1 MB/s eta 0:00:00
Collecting regex!=2019.12.17
  Downloading regex-2025.9.18-cp310-cp310-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (789 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 789.9/789.9 KB 16.6 MB/s eta 0:00:00
Collecting pyyaml>=5.1
  Downloading pyyaml-6.0.3-cp310-cp310-manylinux2014_x86_64.manylinux_2_17_x86_64.manylinux_2_28_x86_64.whl (770 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 770.3/770.3 KB 16.2 MB/s eta 0:00:00
Collecting filelock
  Downloading filelock-3.19.1-py3-none-any.whl (15 kB)
Collecting numpy>=1.17
  Downloading numpy-2.2.6-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (16.8 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 16.8/16.8 MB 18.6 MB/s eta 0:00:00
Collecting packaging>=20.0
  Downloading packaging-25.0-py3-none-any.whl (66 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 66.5/66.5 KB 10.4 MB/s eta 0:00:00
Collecting joblib
  Downloading joblib-1.5.2-py3-none-any.whl (308 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 308.4/308.4 KB 15.8 MB/s eta 0:00:00
Collecting typing-inspection>=0.4.0
  Downloading typing_inspection-0.4.1-py3-none-any.whl (14 kB)
Collecting pydantic-core==2.33.2
  Downloading pydantic_core-2.33.2-cp310-cp310-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (2.0 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 2.0/2.0 MB 17.6 MB/s eta 0:00:00
Collecting annotated-types>=0.6.0
  Downloading annotated_types-0.7.0-py3-none-any.whl (13 kB)
Collecting hf-xet<2.0.0,>=1.1.3
  Downloading hf_xet-1.1.10-cp37-abi3-manylinux_2_17_x86_64.manylinux2014_x86_64.whl (3.2 MB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 3.2/3.2 MB 18.7 MB/s eta 0:00:00
Collecting fsspec>=2023.5.0
  Downloading fsspec-2025.9.0-py3-none-any.whl (199 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 199.3/199.3 KB 16.0 MB/s eta 0:00:00
Collecting anyio<5,>=3.6.2
  Downloading anyio-4.11.0-py3-none-any.whl (109 kB)
     ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 109.1/109.1 KB 8.5 MB/s eta 0:00:00
Collecting sniffio>=1.1
  Downloading sniffio-1.3.1-py3-none-any.whl (10 kB)
Collecting exceptiongroup>=1.0.2
  Downloading exceptiongroup-1.3.0-py3-none-any.whl (16 kB)
Installing collected packages: pyttsx3, urllib3, typing-extensions, tqdm, sniffio, safetensors, regex, pyyaml, python-multipart, python-dotenv, packaging, numpy, joblib, idna, hf-xet, h11, fsspec, filelock, click, charset_normalizer, certifi, annotated-types, uvicorn, typing-inspection, requests, pydantic-core, nltk, exceptiongroup, pydantic, huggingface-hub, anyio, tokenizers, starlette, transformers, fastapi
Successfully installed annotated-types-0.7.0 anyio-4.11.0 certifi-2025.8.3 charset_normalizer-3.4.3 click-8.3.0 exceptiongroup-1.3.0 fastapi-0.118.0 filelock-3.19.1 fsspec-2025.9.0 h11-0.16.0 hf-xet-1.1.10 huggingface-hub-0.35.3 idna-3.10 joblib-1.5.2 nltk-3.9.1 numpy-2.2.6 packaging-25.0 pydantic-2.11.9 pydantic-core-2.33.2 python-dotenv-1.1.1 python-multipart-0.0.20 pyttsx3-2.99 pyyaml-6.0.3 regex-2025.9.18 requests-2.32.5 safetensors-0.6.2 sniffio-1.3.1 starlette-0.48.0 tokenizers-0.21.4 tqdm-4.67.1 transformers-4.49.0 typing-extensions-4.15.0 typing-inspection-0.4.1 urllib3-2.5.0 uvicorn-0.37.0                                      k
WARNING: Package(s) not found: espeakt/backend/realestate_agent# pip show espeak 
3venv) root@host:/opt/vox-estate-agent/backend/realestate_agent# pip show pyttsx 
Name: pyttsx3
Version: 2.99
Summary: Text to Speech (TTS) library for Python 3. Works without internet connection or delay. Supports multiple TTS engines, including Sapi5, nsss, and espeak.
Home-page: 
Author: 
Author-email: Natesh M Bhat <nateshmbhatofficial@gmail.com>
License: 
Location: /opt/vox-estate-agent/backend/realestate_agent/venv/lib/python3.10/site-packages
Requires: 
Required-by: 
eaknv) root@host:/opt/vox-estate-agent/backend/realestate_agent# pip install esp 
ERROR: Could not find a version that satisfies the requirement espeak (from versions: none)
ERROR: No matching distribution found for espeak
eak
ERROR: Could not find a version that satisfies the requirement espeak (from versions: none)
ERROR: No matching distribution found for espeak                 pip show pyttsx3
   which espeakt:/opt/vox-estate-agent/backend/realestate_agent# pip show pyttsx3
   espeak "test"
Name: pyttsx3st"
Version: 2.99
Summary: Text to Speech (TTS) library for Python 3. Works without internet connection or delay. Supports multiple TTS engines, including Sapi5, nsss, and espeak.
Home-page: 
Author: 
Author-email: Natesh M Bhat <nateshmbhatofficial@gmail.com>
License: 
Location: /opt/vox-estate-agent/backend/realestate_agent/venv/lib/python3.10/site-packages
Requires: 
Required-by: 
/usr/bin/espeak
ALSA lib confmisc.c:855:(parse_card) cannot find card '0'
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_card_inum returned error: No such file or directory
ALSA lib confmisc.c:422:(snd_func_concat) error evaluating strings
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_concat returned error: No such file or directory
ALSA lib confmisc.c:1334:(snd_func_refer) error evaluating name
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_refer returned error: No such file or directory
ALSA lib conf.c:5701:(snd_config_expand) Evaluate error: No such file or directory
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM sysdefault
ALSA lib confmisc.c:855:(parse_card) cannot find card '0'
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_card_inum returned error: No such file or directory
ALSA lib confmisc.c:422:(snd_func_concat) error evaluating strings
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_concat returned error: No such file or directory
ALSA lib confmisc.c:1334:(snd_func_refer) error evaluating name
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_refer returned error: No such file or directory
ALSA lib conf.c:5701:(snd_config_expand) Evaluate error: No such file or directory
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM sysdefault
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.front
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.rear
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.center_lfe
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.side
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.surround21
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.surround21
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.surround40
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.surround41
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.surround50
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.surround51
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.surround71
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.iec958
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.iec958
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.iec958
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.hdmi
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.hdmi
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.modem
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.modem
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.phoneline
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM cards.pcm.phoneline
ALSA lib confmisc.c:855:(parse_card) cannot find card '0'
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_card_inum returned error: No such file or directory
ALSA lib confmisc.c:422:(snd_func_concat) error evaluating strings
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_concat returned error: No such file or directory
ALSA lib confmisc.c:1334:(snd_func_refer) error evaluating name
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_refer returned error: No such file or directory
ALSA lib conf.c:5701:(snd_config_expand) Evaluate error: No such file or directory
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM default
ALSA lib confmisc.c:855:(parse_card) cannot find card '0'
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_card_inum returned error: No such file or directory
ALSA lib confmisc.c:422:(snd_func_concat) error evaluating strings
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_concat returned error: No such file or directory
ALSA lib confmisc.c:1334:(snd_func_refer) error evaluating name
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_refer returned error: No such file or directory
ALSA lib conf.c:5701:(snd_config_expand) Evaluate error: No such file or directory
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM default
ALSA lib confmisc.c:855:(parse_card) cannot find card '0'
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_card_id returned error: No such file or directory
ALSA lib confmisc.c:422:(snd_func_concat) error evaluating strings
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_concat returned error: No such file or directory
ALSA lib confmisc.c:1334:(snd_func_refer) error evaluating name
ALSA lib conf.c:5178:(_snd_config_evaluate) function snd_func_refer returned error: No such file or directory
ALSA lib conf.c:5701:(snd_config_expand) Evaluate error: No such file or directory
ALSA lib pcm.c:2664:(snd_pcm_open_noupdate) Unknown PCM dmix
Cannot connect to server socket err = No such file or directory
Cannot connect to server request channel
jack server is not running or cannot be started
JackShmReadWritePtr::~JackShmReadWritePtr - Init not done for -1, skipping unlock
JackShmReadWritePtr::~JackShmReadWritePtr - Init not done for -1, skipping unlock
wave_open_sound > Pa_OpenStream : err=-9996 (Invalid device)
wave_open_sound > Pa_OpenStream : err=-9996 (Invalid device)
wave_open_sound > Pa_OpenStream : err=-9996 (Invalid device)
wave_open_sound > Pa_OpenStream : err=-9996 (Invalid device)
(venv) root@host:/opt/vox-estate-agent/backend/realestate_agent# 




web-frontend/webfront/build
** So i will copy from my local machine termina for the server :
env) root@host:/opt/vox-estate-agent/web-frontend/webfront# ls
CHANGES React_tips package-lock.json public
README.md babel.config.js package.json src



To deploy your React build to the server, copy the contents of your local build directory to the server’s deployment directory.

Assuming your server’s target directory is `/opt/vox-estate-agent/web-frontend/dist`, use this command from your local machine:

```bash
scp -r web-frontend/webfront/build/* 84.201.4.127:/opt/vox-estate-agent/web-frontend/dist/
```

84.201.4.127

- Replace `your-server` with your server’s IP or hostname.
- If `/opt/vox-estate-agent/web-frontend/dist` does not exist, create it first on the server:
  ```bash
  mkdir -p /opt/vox-estate-agent/web-frontend/dist
  ```

After copying, verify on the server:
```bash
ls /opt/vox-estate-agent/web-frontend/dist
```

Your static files are now ready for nginx or your web server to serve. Let me know if you need nginx config help or want to automate this step!


