# ttspyx3 benchmark helper

This small tool helps you measure wall-clock time and peak RSS memory for running
a ttspyx3 inference command (or any command). It's useful to validate whether a
VPS with limited RAM (2–4 GB) can load and run the model.

Files
- `ttspyx3_benchmark.py`: the harness (requires `psutil`).
- `requirements_ttspyx3_bench.txt`: minimal dependency list.

Quick start

1. Create or activate a Python virtualenv and install deps:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/tools/requirements_ttspyx3_bench.txt
```

2. Run a quick self-test (no model) to verify the harness:

```bash
python backend/tools/ttspyx3_benchmark.py --py "import time; a=bytearray(200_000_000); time.sleep(0.5)" --trials 2 --warmup 1
```

3. Run your real ttspyx3 inference command (example — replace with your run command):

```bash
# Example: run a one-shot inference command in your project
python backend/tools/ttspyx3_benchmark.py --cmd "python -m realestate_agent.run_tts --once" --trials 3 --warmup 1
```

Notes / tips
- Use `--warmup 1` to allow the model to cold-start before measured trials.
- Run the same command on a small VM sized like the VPS you plan to buy to get realistic numbers.
- The script reports peak RSS (MiB). For safe operation on a VPS, allow at least 25–50% headroom above peak RSS for OS and other processes.




###############################################################################################
###################################     Implementation  #######################################
###############################################################################################



"""
ModuleNotFoundError: No module named 'psutil'
hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent$ cd backend/realestate_agent/
hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ source venv/bin/activate
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$  Install psutil>=5.9 in Python 3.11.13?
Command 'Install' not found, did you mean:
  command 'install' from deb coreutils (9.4-3ubuntu6.1)
Try: sudo apt install <deb name>
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ pip install 'psutil>=5.9'
Requirement already satisfied: psutil>=5.9 in ./venv/lib/python3.11/site-packages (7.0.0)
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ python -c "import psutil; print('psutil', psutil.__version__)"
psutil 7.0.0
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ python ../../backend/tools/ttspyx3_benchmark.py --py "import time; a=bytearray(50_000_000); time.sleep(0.2)" --trials 2 --warmup 1
Running: warmup
  rc=0 wall=0.304s peak_rss=55.4MiB
Running: trial-1
  rc=0 wall=0.303s peak_rss=55.4MiB
Running: trial-2
  rc=0 wall=0.303s peak_rss=55.4MiB

Summary (successful runs):
  runs=2 avg_time=0.303s min_time=0.303s max_time=0.303s
  avg_peak_rss=55.4MiB min_peak=55.4MiB max_peak=55.4MiB



-----------------------------

Bash result:
nt$ python ../../backend/tools/ttspyx3_benchmark.py --py "import time; a=bytearray(50_000_000); time.sleep(0.2)" --trials 2 --warmup 1
Running: warmup
  rc=0 wall=0.304s peak_rss=55.4MiB
Running: trial-1
  rc=0 wall=0.303s peak_rss=55.4MiB
Running: trial-2
  rc=0 wall=0.303s peak_rss=55.4MiB

Summary (successful runs):
  runs=2 avg_time=0.303s min_time=0.303s max_time=0.303s
  avg_peak_rss=55.4MiB min_peak=55.4MiB max_peak=55.4MiB













  I'll mark a new todo "Run model benchmark and analyze" as in-progress, then analyze your self-test output and provide precise next commands and interpretation. 

Completed (5/6) *Self-test run of benchmark script*

Great — the self-test ran successfully and the harness works.

What you ran
- Command: `python ../../backend/tools/ttspyx3_benchmark.py --py "import time; a=bytearray(50_000_000); time.sleep(0.2)" --trials 2 --warmup 1`
- Result summary:
  - Per-trial wall time: ~0.303s
  - Peak RSS: ~55.4 MiB
  - Summary: avg_time=0.303s, avg_peak_rss=55.4 MiB

Interpretation
- This self-test only verified the benchmarking harness and that psutil is installed and working. The allocated 50 MiB bytearray produced a peak RSS ≈ 55 MiB (which includes interpreter overhead).
- This result does not reflect ttspyx3 model memory or inference time; it's only a functional check.

Next step: run the benchmark against your real ttspyx3 inference command
- I will analyze the real numbers (peak RSS and time) and recommend whether `VPS Business (2vCPU/2GB)` is feasible or if `VPS Professional (3vCPU/4GB)` or a larger worker is required.
- Please run one of these (pick the one that matches your workflow):

A) If you have a single-command one-shot inference (recommended)
- Replace the quoted example with your real command (the command that loads the model and synthesizes one sentence). Example:

```bash
python ../../backend/tools/ttspyx3_benchmark.py --cmd "python -m realestate_agent.run_tts --once \"Hello world\"" --trials 3 --warmup 1
```

B) If you run a local HTTP worker and want to test it via curl (measure client-side only): start the worker with one-shot endpoint and run:

```bash
# measure a single HTTP call by wrapping curl in the benchmark (less accurate for server-side peak)
python ../../backend/tools/ttspyx3_benchmark.py --cmd "curl -sS -X POST http://127.0.0.1:5100/tts -d '{\"text\": \"Hello\"}' -H 'Content-Type: application/json' -o /dev/null" --trials 3 --warmup 1
```

C) If your inference is a Python function inside the project (callable), and you can call it via `python -c '...'`, use `--cmd` or `--py` appropriately:

```bash
python ../../backend/tools/ttspyx3_benchmark.py --py "from realestate_agent import tts; tts.run_once('Hello')" --trials 3 --warmup 1
```

Guidance for interpreting results (what I'll look for)
- Peak RSS < 1.2 GiB: likely fits comfortably on a 2 GiB VPS only if OS/process overhead stays low — still risky (no headroom) and concurrency = 1 only. Swap helps but degrades performance.
- Peak RSS between 1.2 GiB and 2.5 GiB: 4 GiB VPS recommended (VPS Professional).
- Peak RSS > 2.5 GiB: plan for a dedicated worker (8+ GiB) or GPU instance.

After you run your real benchmark command
- Paste the script's Summary block here and I'll recommend which VPS tier to pick and give exact config steps (swap, systemd unit, worker limits, nginx proxy) optimized for that tier.

If you want, I can also:
- Run a short guidance checklist to help you run the model in a warm process (warm boot) or run a small stress test with multiple sequential requests to see memory behavior across multiple inferences.


"""








#############################################################################
I'll search the repository for likely entrypoints (`run_tts`, `run_tts.py`, `tts_service`, CLI entry) to find the exact command to benchmark, then run the benchmark command (as you requested) and report the measured peak memory and times. I'll run a small batch: (1) search files, (2) read the candidate file(s), and (3) run the benchmark using your provided command. 

Searched text for `run_tts|run_tts.py|tts_service|ttspyx3|def run|if __name__ == '__main__'` (`**/backend/**`), 100 results

I'll read the tts_service.py file to find the correct command or function to invoke for a one-shot TTS run, then run the benchmark tool with that command and report results. I'll read the file now. 

Read [](file:///home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/tts_service.py)

Searched text for `run_tts` (`**/backend/**`), 6 results

Read [](file:///home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/main.py)

Searched text for `generate_tts_audio|ttspyx3|ttspyx` (`**/backend/**`), 29 results

Read [](file:///home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/tts/tts_simple.py)

Searched for files matching `**/backend/realestate_agent/tts/**`, 2 matches

I'll run the benchmark harness from realestate_agent to call `app.tts_service.text_to_speech('Hello world')` directly (this measures the server-side code in a fresh process). This will create audio in `static/audio/` and report wall time + peak RSS. I'll run 3 trials with one warmup. 

Ran terminal command: python ../../backend/tools/ttspyx3_benchmark.py --py "from app.tts_service import tts_service; print(tts_service.text_to_speech('Hello world'))" --trials 3 --warmup 1

python ../../backend/tools/ttspyx3_benchmark.py --py "from app.tts_service import tts_service; print(tts_service.text_to_speech('Hello world'))" --trials 3 --warmup 1


python ../../backend/tools/ttspyx3_benchmark.py --cmd "python -c \"import importlib.util,sys; spec=importlib.util.spec_from_file_location('tts_s','/home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/tts_service.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); print(mod.tts_service.text_to_speech('Hello world'))\"" --trials 3 --warmup 1


Bash:
############################

nt$ python -m uvicorn app.main:app  --host 0.0.0.0 --port 8000
Loading environment variables from: /home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/.env
Current working directory: /home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent
OPENAI_API_KEY is set: Yes
INFO:app.tts_service:Initializing TTS engine...
INFO:app.tts_service:TTS Engine initialized with voice: gmw/en
INFO:     Started server process [94798]
INFO:     Waiting for application startup.
INFO:app.main:Application startup: Created necessary directories
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
^CINFO:     Shutting down
INFO:     Waiting for application shutdown.
INFO:     Application shutdown complete.
INFO:     Finished server process [94798]
python ../../backend/tools/ttspyx3_benchmark.py --py "from app.tts_service import tts_service; print(tts_service.text_to_speech('Hello world'))" --trials 3 --warmup 1
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ python ../../backend/tools/ttspyx3_benchmark.py --py "from app.tts_service import tts_service; print(tts_service.text_to_speech('Hello world'))" --trials 3 --warmup 1
Running: warmup
  rc=0 wall=1.062s peak_rss=45.0MiB
  stderr (tail):
INFO:app.tts_service:Initializing TTS engine...
INFO:app.tts_service:TTS Engine initialized with voice: gmw/en
INFO:app.tts_service:Generating speech for text: Hello world...
INFO:app.tts_service:Successfully generated speech file at: static/audio/output_20250921_003417_3a90a2da.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003417_3a90a2da.wav)
Running: trial-1
  rc=0 wall=0.908s peak_rss=45.2MiB
  stderr (tail):
INFO:app.tts_service:Initializing TTS engine...
INFO:app.tts_service:TTS Engine initialized with voice: gmw/en
INFO:app.tts_service:Generating speech for text: Hello world...
INFO:app.tts_service:Successfully generated speech file at: static/audio/output_20250921_003418_8fcf5860.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003418_8fcf5860.wav)
Running: trial-2
  rc=0 wall=0.907s peak_rss=45.3MiB
  stderr (tail):
INFO:app.tts_service:Initializing TTS engine...
INFO:app.tts_service:TTS Engine initialized with voice: gmw/en
INFO:app.tts_service:Generating speech for text: Hello world...
INFO:app.tts_service:Successfully generated speech file at: static/audio/output_20250921_003419_201103fd.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003419_201103fd.wav)
Running: trial-3
  rc=0 wall=0.906s peak_rss=45.2MiB
  stderr (tail):
INFO:app.tts_service:Initializing TTS engine...
INFO:app.tts_service:TTS Engine initialized with voice: gmw/en
INFO:app.tts_service:Generating speech for text: Hello world...
INFO:app.tts_service:Successfully generated speech file at: static/audio/output_20250921_003419_0374288f.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003419_0374288f.wav)

Summary (successful runs):
  runs=3 avg_time=0.907s min_time=0.906s max_time=0.908s
  avg_peak_rss=45.3MiB min_peak=45.2MiB max_peak=45.3MiB
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ python ../../backend/tools/ttspyx3_benchmark.py --cmd "python -c \"import importlib.util,sys; spec=importlib.util.spec_from_file_location('tts_s','/home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/tts_service.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); print(mod.tts_service.text_to_speech('Hello world'))\"" --trials 3 --warmup 1
Running: warmup
  rc=0 wall=0.960s peak_rss=45.2MiB
  stderr (tail):
INFO:tts_s:Initializing TTS engine...
INFO:tts_s:TTS Engine initialized with voice: gmw/en
INFO:tts_s:Generating speech for text: Hello world...
INFO:tts_s:Successfully generated speech file at: static/audio/output_20250921_003505_7ea37ec0.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003505_7ea37ec0.wav)
Running: trial-1
  rc=0 wall=0.807s peak_rss=45.0MiB
  stderr (tail):
INFO:tts_s:Initializing TTS engine...
INFO:tts_s:TTS Engine initialized with voice: gmw/en
INFO:tts_s:Generating speech for text: Hello world...
INFO:tts_s:Successfully generated speech file at: static/audio/output_20250921_003505_6852d587.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003505_6852d587.wav)
Running: trial-2
  rc=0 wall=0.755s peak_rss=45.1MiB
  stderr (tail):
INFO:tts_s:Initializing TTS engine...
INFO:tts_s:TTS Engine initialized with voice: gmw/en
INFO:tts_s:Generating speech for text: Hello world...
INFO:tts_s:Successfully generated speech file at: static/audio/output_20250921_003506_735561fc.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003506_735561fc.wav)
Running: trial-3
  rc=0 wall=0.857s peak_rss=45.2MiB
  stderr (tail):
INFO:tts_s:Initializing TTS engine...
INFO:tts_s:TTS Engine initialized with voice: gmw/en
INFO:tts_s:Generating speech for text: Hello world...
INFO:tts_s:Successfully generated speech file at: static/audio/output_20250921_003507_8d60edb0.wav (Size: 56844 bytes, URL: /static/audio/output_20250921_003507_8d60edb0.wav)

Summary (successful runs):
  runs=3 avg_time=0.806s min_time=0.755s max_time=0.857s
  avg_peak_rss=45.1MiB min_peak=45.0MiB max_peak=45.2MiB
(venv) hazem-elbatawy@hazem-elbatawy-Vostro-15-3510:~/Downloads/vox-estate-agent/backend/realestate_agent$ 









#########################################################

                                Results for the ttspysx3 test benchmark vps

                                ###########################################################

I'll search the repository for likely entrypoints (`run_tts`, `run_tts.py`, `tts_service`, CLI entry) to find the exact command to benchmark, then run the benchmark command (as you requested) and report the measured peak memory and times. I'll run a small batch: (1) search files, (2) read the candidate file(s), and (3) run the benchmark using your provided command. 

Searched text for `run_tts|run_tts.py|tts_service|ttspyx3|def run|if __name__ == '__main__'` (`**/backend/**`), 100 results

I'll read the tts_service.py file to find the correct command or function to invoke for a one-shot TTS run, then run the benchmark tool with that command and report results. I'll read the file now. 

Read [](file:///home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/tts_service.py)

Searched text for `run_tts` (`**/backend/**`), 6 results

Read [](file:///home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/main.py)

Searched text for `generate_tts_audio|ttspyx3|ttspyx` (`**/backend/**`), 29 results

Read [](file:///home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/tts/tts_simple.py)

Searched for files matching `**/backend/realestate_agent/tts/**`, 2 matches

I'll run the benchmark harness from realestate_agent to call `app.tts_service.text_to_speech('Hello world')` directly (this measures the server-side code in a fresh process). This will create audio in `static/audio/` and report wall time + peak RSS. I'll run 3 trials with one warmup. 

Ran terminal command: python ../../backend/tools/ttspyx3_benchmark.py --py "from app.tts_service import tts_service; print(tts_service.text_to_speech('Hello world'))" --trials 3 --warmup 1

Read [](file:///home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/__init__.py)

Searched text for `uvicorn.run` (`**/**`), 49 results

I'll run the benchmark by loading tts_service.py directly from its file path (avoids importing `app.main` which starts uvicorn). This measures server-side TTS execution in a fresh process and reports peak memory and time. I'll run 1 warmup + 3 trials. 

Ran terminal command: python ../../backend/tools/ttspyx3_benchmark.py --cmd "python -c \"import importlib.util,sys; spec=importlib.util.spec_from_file_location('tts_s','/home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/tts_service.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); print(mod.tts_service.text_to_speech('Hello world'))\"" --trials 3 --warmup 1

I'll update the todo list to mark the benchmark run completed (noting it measured `pyttsx3`) and add a follow-up todo to benchmark the actual `ttspyx3` if you want; then I'll summarize the measured results, explain what was benchmarked, and provide clear next steps and commands to benchmark the ttspyx3 model or an HTTP worker. 

Completed (6/7) *Run model benchmark and analyze (pyttsx3)*

Progress update: I ran the benchmark harness against your backend `tts_service.text_to_speech()` (which uses `pyttsx3`) by loading tts_service.py directly (avoiding starting the full FastAPI server). Results and next steps below.

What I measured (the run you asked me to perform)
- Command used (executed inside realestate_agent venv):
  python ttspyx3_benchmark.py --cmd "python -c \"import importlib.util,sys; spec=importlib.util.spec_from_file_location('tts_s','/home/hazem-elbatawy/Downloads/vox-estate-agent/backend/realestate_agent/app/tts_service.py'); mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod); print(mod.tts_service.text_to_speech('Hello world'))\"" --trials 3 --warmup 1

Measured results
- Warmup: wall=0.960s, peak_rss=45.2 MiB
- Trial 1: wall=0.807s, peak_rss=45.0 MiB
- Trial 2: wall=0.755s, peak_rss=45.1 MiB
- Trial 3: wall=0.857s, peak_rss=45.2 MiB
- Summary (successful runs): runs=3 avg_time=0.806s avg_peak_rss=45.1 MiB

Interpretation
- The benchmark measured `pyttsx3` calling into the system TTS engine — it is lightweight (peak RSS ≈ 45 MiB) and fast (~0.8s) on your laptop.
- This is NOT ttspyx3 — it's using `pyttsx3` (local system TTS) and `gTTS` in tts_simple.py elsewhere. The `pyttsx3` engine you use in tts_service.py is very light relative to model-based TTS such as ttspyx3.
- Because you said earlier you use ttspyx3 for the OpenAI response audio, we need to benchmark the actual ttspyx3 model (or the specific model/command you run) to size a VPS correctly.








########################################################################
Recommended next steps (pick one)
--------------------------------

1) Benchmark ttspyx3 locally now (I can run it if you give me the exact command you use to invoke ttspyx3, or I can try to find common ttspyx3 demo entrypoints in the repo/venv and run them). 
This will give peak RSS and latency for real model inference.

   - If you run ttspyx3 via a CLI or module, provide that command (e.g., `python -m ttspyx3.run --text "Hello"` or the exact script you run).

   - If ttspyx3 runs as an HTTP worker, give the worker start command and I'll benchmark a single request via `curl` or measure the worker process directly.

2) If you prefer to keep the remote-first demo approach, I can:
------------------------------------------------------------------

   - Add the FastAPI fallback snippet to your repo so the app prefers OpenAI TTS but can call a local worker when needed.
   - Prefill `systemd` + `nginx` snippets for `VPS Professional (3vCPU/4GB)` to run the web app and prepare a separate worker host later.

How I can help immediately
----------------------------
- If you paste the exact ttspyx3 command you run locally (or tell me the module name/path), I'll run the benchmark harness with the same pattern and report peak RSS/time and a VPS recommendation.
- Or I can attempt to find common ttspyx3 usage in the venv (e.g., tts-server or `venv` packages) and try a safe benchmark run — tell me if you want me to attempt that.

Edge notes
- If ttspyx3 is GPU-capable, it may try to use CUDA; running that on a CPU-only VPS will change memory/latency profile.
- If the model loads hundreds of MBs to a few GBs, the `VPS Professional (3vCPU/4GB)` is safer; for >4GB, consider dedicated worker with 8+GB RAM or GPU instance.

Tell me the ttspyx3 run command you use (or say "scan and try" and I'll search for likely entrypoints in your venv and run a cautious test).