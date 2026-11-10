"""qc.py · measure an episode the same way every time: $LIB/.venv/bin/python history-shorts/tools/qc.py history-shorts/<slug>
Prints loudness, length, blank frames, motion (share of frame pairs whose mean grey difference at 135×240 exceeds 0.1/0.2/0.3/0.5),
the longest stretch below each threshold, and >4 kHz level during the scene-change sweeps vs the rest (hiss check)."""
import sys, json, subprocess, re, numpy as np, os
FF='/opt/ffmpeg7/bin/ffmpeg'
d=sys.argv[1]; name=os.path.basename(d); mp4=f'{d}/{name}.mp4'
# loudness
o=subprocess.run([FF,'-hide_banner','-i',mp4,'-af','ebur128','-f','null','-'],capture_output=True,text=True).stderr
I=re.findall(r'I:\s+(-?[\d.]+) LUFS',o)[-1]
# frames: 24 fps, 135x240 gray
raw=subprocess.run([FF,'-v','error','-i',mp4,'-vf','scale=135:240,format=gray','-f','rawvideo','-'],capture_output=True).stdout
F=np.frombuffer(raw,np.uint8).reshape(-1,240,135).astype(np.float32)
n=len(F); dur=n/24
diff=np.abs(np.diff(F,axis=0)).mean((1,2))
res={'frames':n,'dur_s':round(dur,2),'LUFS':float(I)}
for T in (.1,.2,.3,.5):
    ch=diff>T; res[f'motion@{T}']=round(100*ch.mean(),1)
    run=m=0
    for c in ch: run=0 if c else run+1; m=max(m,run)
    res[f'frozen_max_s@{T}']=round(m/24,2)
res['blank_frames']=int(((F.mean((1,2))<8)|(F.std((1,2))<2)).sum())
# hiss: >4 kHz energy in sweeps vs the rest
import soundfile as sf
a=subprocess.run([FF,'-v','error','-i',mp4,'-ac','1','-ar','48000','-f','f32le','-'],capture_output=True).stdout
x=np.frombuffer(a,np.float32); from scipy.signal import butter,sosfilt
h=sosfilt(butter(4,4000,'high',fs=48000,output='sos'),x)
TL=json.load(open(f'{d}/timeline.json')); m=np.zeros(len(h),bool)
for e in TL['eras'][1:]: m[int(e['sweep']*48000):int((e['sweep']+e['swdur'])*48000)]=True
r=lambda v:20*np.log10(np.sqrt((v**2).mean())+1e-12)
res['hf_sweep_dB']=round(r(h[m]),1); res['hf_rest_dB']=round(r(h[~m]),1)
print(json.dumps(res))
