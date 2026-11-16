# writes cfg_<demo>.json: line start times, caption cues (split by characters, each cue >= 1.8 s), total length
import json
D=json.load(open('out/voice/dur.json'))
plan={
 'glass':{'dur':10.8,'lines':[('glass1',.4,['This empire was richer than Rome. | You\'ve never heard of it.']),('glass2',3.9,['In 1324, the king of Mali','brought so much gold to Cairo,','its value fell for years.'])],'mark':3.9},
 'blue':{'dur':10.0,'lines':[('blue1',.5,['Coffee was once banned in Mecca.']),('blue2',3.0,['Today, the world drinks about | two billion cups a day.','Here\'s how it happened.'])],'mark':3.0},
 'wood':{'dur':10.0,'lines':[('wood1',.4,['You wake up in the year 100. | You\'re a Roman soldier.']),('wood2',4.4,['Today, you\'ll march 20 Roman miles,','carrying your own gear.'])],'mark':4.4},
}
for k,p in plan.items():
  caps=[];starts=[]
  for i,(lid,t0,chunks) in enumerate(p['lines']):
    d=D[lid];starts.append({'id':lid,'t':t0,'d':d});n=sum(len(c) for c in chunks);t=t0
    nxt=p['lines'][i+1][1] if i+1<len(p['lines']) else p['dur']
    for j,c in enumerate(chunks):
      e=t+d*len(c)/n
      if j==len(chunks)-1: e=min(nxt, t0+d+.6)
      caps.append({'t0':round(t,3),'t1':round(e,3),'text':c}); t=e
  for c in caps: assert c['t1']-c['t0']>=1.8, (k,c)
  json.dump({'dur':p['dur'],'caps':caps,'voice':starts,'mark':p['mark']},open(f'out/cfg_{k}.json','w'),indent=1)
  print(k,[(c['t0'],c['t1']) for c in caps])
