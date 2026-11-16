# Second-channel style demos (10 s each)

Three test clips for a possible second channel. None of this touches `history-shorts/`.

| File | Series idea | Style | Voice |
|---|---|---|---|
| `demo_glass.mp4` | Lost Empires (Mali, 1324) | stained glass: leads draw, panes light up, caravan walks | af_heart |
| `demo_blue.mp4` | One Thing, All of History (coffee) | blueprint: pen draws, dimensions, counter, timeline ruler | am_michael |
| `demo_wood.mp4` | A Day in the Life (Roman legionary) | woodcut: blocks stamped, soldier marches, milestone passes | bm_daniel |

Rebuild: `node render.mjs <demo>.html out/cfg_<demo>.json out/video_<demo>.mp4` (after `python3 timing.py` and the voice from `lines.json`),
then `python audio.py <demo>` and mux with loudnorm −14 LUFS. Music and sound are synthesised in `audio.py`.

Facts used (demo-level, re-check before any real episode): Mansa Musa's 1324 pilgrimage through Cairo depressed the value of gold there for years;
coffee banned in Mecca in 1511; ~2 billion cups drunk a day worldwide (commonly cited estimate); Istanbul coffeehouses 1554, London's first 1652,
coffee in Brazil 1727; Vegetius: recruits trained to march 20 Roman miles in 5 hours.
