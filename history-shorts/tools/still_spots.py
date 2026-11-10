"""still_spots.py · where the picture goes quiet: per-era share of near-still frames and every stretch ≥ 1.25 s below 0.3."""
import sys,subprocess,numpy as np,json
FF='/opt/ffmpeg7/bin/ffmpeg'; d=sys.argv[1]; import os; n=os.path.basename(d)
raw=subprocess.run([FF,'-v','error','-i',f'{d}/{n}.mp4','-vf','scale=135:240,format=gray','-f','rawvideo','-'],capture_output=True).stdout
F=np.frombuffer(raw,np.uint8).reshape(-1,240,135).astype(np.float32); diff=np.abs(np.diff(F,axis=0)).mean((1,2))
TL=json.load(open(f'{d}/timeline.json')); eras=TL['eras']
def era(t):
    if t>=TL['end']['wall']: return 'WALL'
    s='cold'
    for e in eras:
        if t>=e['sweep']: s=e['scene']
    return s
from collections import defaultdict
agg=defaultdict(list)
for i,v in enumerate(diff): agg[era(i/24)].append(v)
for k,v in agg.items(): v=np.array(v); print(f"{k:10s} n={len(v):4d} med={np.median(v):.2f} <0.3:{100*(v<.3).mean():4.0f}%")
# runs below .3
run=0
for i,v in enumerate(list(diff)+[9]):
    if v<.3: run+=1
    else:
        if run>=30: print(f"still {(i-run)/24:.2f}-{i/24:.2f}s ({run/24:.2f}s) {era((i-run)/24)}")
        run=0
