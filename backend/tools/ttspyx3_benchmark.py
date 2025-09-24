#!/usr/bin/env python3
"""
ttspyx3_benchmark.py

Small harness to run a command (or Python module) that performs TTS inference and
measure wall-clock time and peak RSS memory.

Usage examples:
  # Run an external command (your project's inference entrypoint)
  python backend/tools/ttspyx3_benchmark.py --cmd "python -m myproject.tts_server --once" --trials 3 --warmup 1

  # Or run a simple Python snippet for quick self-test
  python backend/tools/ttspyx3_benchmark.py --py "import time; a=bytearray(200_000_000); time.sleep(0.5)" --trials 2

The script prints per-trial wall time and peak RSS (MiB) and a small summary.
"""

import argparse
import subprocess
import sys
import time
import shlex
import os

try:
    import psutil
except Exception:
    print("psutil is required. Install: pip install psutil", file=sys.stderr)
    raise


def run_command_and_measure(cmd, timeout=None):
    """Run cmd (list form) and measure wall time and peak RSS in MiB.

    Returns (returncode, wall_seconds, peak_rss_mib, stdout, stderr)
    """
    start = time.time()
    # start subprocess
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    p = psutil.Process(proc.pid)
    peak = 0
    try:
        while True:
            if proc.poll() is not None:
                break
            try:
                mem = p.memory_info().rss
            except psutil.NoSuchProcess:
                break
            if mem > peak:
                peak = mem
            time.sleep(0.05)
        # capture any final memory
        try:
            mem = p.memory_info().rss
            if mem > peak:
                peak = mem
        except Exception:
            pass
        stdout, stderr = proc.communicate(timeout=timeout)
    except subprocess.TimeoutExpired:
        proc.kill()
        stdout, stderr = proc.communicate()
        return proc.returncode or -9, time.time()-start, peak/1024/1024, stdout.decode(errors='ignore'), stderr.decode(errors='ignore')

    return proc.returncode, time.time()-start, peak/1024/1024, stdout.decode(errors='ignore'), stderr.decode(errors='ignore')


def run_py_snippet(snippet):
    # Run python -c <snippet>
    cmd = [sys.executable, '-c', snippet]
    return run_command_and_measure(cmd)


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--cmd', help='Run this shell command (quoted).')
    p.add_argument('--py', help='Run this python code snippet with `python -c`.')
    p.add_argument('--trials', type=int, default=3)
    p.add_argument('--warmup', type=int, default=0, help='Number of warmup runs before measurement')
    p.add_argument('--timeout', type=int, default=300, help='Timeout per run (seconds)')
    args = p.parse_args()

    if not args.cmd and not args.py:
        p.error('provide --cmd or --py')

    runs = []

    total_runs = args.warmup + args.trials

    for i in range(total_runs):
        is_warm = i < args.warmup
        label = 'warmup' if is_warm else f'trial-{i - args.warmup + 1}'
        print(f'Running: {label}')
        sys.stdout.flush()
        if args.cmd:
            # use shell splitting carefully
            cmdlist = shlex.split(args.cmd)
            rc, wall, peak, so, se = run_command_and_measure(cmdlist, timeout=args.timeout)
        else:
            rc, wall, peak, so, se = run_py_snippet(args.py)

        print(f'  rc={rc} wall={wall:.3f}s peak_rss={peak:.1f}MiB')
        if se:
            print('  stderr (tail):')
            print('\n'.join(se.splitlines()[-6:]))
        if not is_warm:
            runs.append((rc, wall, peak))

    # summary
    successes = [r for r in runs if r[0] == 0]
    if successes:
        times = [r[1] for r in successes]
        peaks = [r[2] for r in successes]
        print('\nSummary (successful runs):')
        print(f'  runs={len(successes)} avg_time={sum(times)/len(times):.3f}s min_time={min(times):.3f}s max_time={max(times):.3f}s')
        print(f'  avg_peak_rss={sum(peaks)/len(peaks):.1f}MiB min_peak={min(peaks):.1f}MiB max_peak={max(peaks):.1f}MiB')
    else:
        print('\nNo successful runs (non-zero return codes). See stderr above.')


if __name__ == '__main__':
    main()

