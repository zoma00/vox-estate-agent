import time
import psutil
import logging
from pathlib import Path

# Import the singleton tts_service from the app package
import sys
sys.path.append(str(Path(__file__).resolve().parents[1] / ''))
try:
    from app.tts_service import tts_service
except Exception as e:
    print(f"Failed to import tts_service: {e}")
    raise


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("pyttsx3-seq-test")


def sample_rss(pid: int) -> int:
    """Return RSS in bytes for given pid (or current process if pid==0)."""
    p = psutil.Process(pid) if pid else psutil.Process()
    try:
        m = p.memory_info().rss
        return m
    except Exception:
        return -1


def human_bytes(n: int) -> str:
    for unit in ['B', 'KiB', 'MiB', 'GiB']:
        if abs(n) < 1024.0:
            return f"{n:.1f} {unit}"
        n /= 1024.0
    return f"{n:.1f} TiB"


def run_sequential_tests(num_calls=3, text_template="Hello from pyttsx3 call #{i}"):
    results = []
    pid = 0  # current process

    logger.info(f"Starting sequential pyttsx3 test with {num_calls} calls")

    # Sample baseline memory
    baseline = sample_rss(pid)
    logger.info(f"Baseline RSS: {human_bytes(baseline)}")

    for i in range(1, num_calls + 1):
        text = text_template.format(i=i)
        start = time.perf_counter()
        try:
            path, url = tts_service.text_to_speech(text)
            elapsed = time.perf_counter() - start
            rss = sample_rss(pid)
            logger.info(f"Call {i}: duration={elapsed:.3f}s rss={human_bytes(rss)} path={path}")
            results.append((i, elapsed, rss, path))
        except Exception as e:
            elapsed = time.perf_counter() - start
            rss = sample_rss(pid)
            logger.error(f"Call {i} failed after {elapsed:.3f}s rss={human_bytes(rss)} error={e}")
            results.append((i, elapsed, rss, None))
        # short pause between calls to simulate sequential client requests
        time.sleep(0.2)

    # Summary
    times = [r[1] for r in results if r[2] is not None]
    rss_vals = [r[2] for r in results if r[2] is not None]
    print("\n--- Summary ---")
    if times:
        print(f"calls={len(times)} avg_time={sum(times)/len(times):.3f}s min_time={min(times):.3f}s max_time={max(times):.3f}s")
    if rss_vals:
        print(f"baseline_rss={human_bytes(baseline)} max_rss={human_bytes(max(rss_vals))} avg_rss={human_bytes(sum(rss_vals)/len(rss_vals))}")
    print("Files created:")
    for r in results:
        if r[3]:
            print(f" - {r[3]}")


if __name__ == '__main__':
    run_sequential_tests(num_calls=3)
