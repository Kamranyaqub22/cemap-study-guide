# India in 60 Seconds — Treatment

Series: History in 60 Seconds (@PrintedHistory) · Silkscreen Travel Poster · 1080×1920, 24 fps, 50.3 s.

| | Italy | United Kingdom | India |
|---|---|---|---|
| Hook | a question with a paradox | the peak first, then rewind | **talks to the viewer about something in their hands** ("Every time you write a zero, you're using an idea from India."), paid off in the 628 era |
| Cold open | crane up the Colosseum | push in with a roll | **descend in an arc**: from the dome's finial, down and across the Taj Mahal to its pool, easing out to the full print |
| Base | Tuscan hills, cypresses | chalk downs, hedged fields | **a big low sun ringed with halos, monsoon cloud billows in two speeds, layered blue hills, rice terraces with glinting water, a banyan with hanging roots, parakeets**; monsoon rain on 1858 |
| Signature | mosaic set ring by ring | steam-engine wipe | **the brush-painted zero**: in 628 there is no squeegee: a brush paints a giant zero, the new print appears inside it like a clock-hand, then the ring widens off the page. It plays in its own pause between lines |
| Silence | 476 | 1940 | 1858: the tabla stops on "ruled"; one low sitar note slides down over the drone and the rain |
| Comeback | Renaissance | today's peal | 1930: the key turns to major and a sitar chord lands as the march reaches the sea; today ends on a tabla tihai |
| Instruments | mandolin, accordion, tamburello 6/8 | bells, brass, snare 4/4 | **sitar (buzzing string, meend glides), tabla (dayan + bayan), tanpura drone**, teental (16 beats); D kafi → D bilawal from 1930 |
| Ending | "Where should we print next?" | "Which era would you visit?" | **"What surprised you most? Tell us below."** — card "WHAT / SURPRISED YOU?" |

Eras: 2500 BC the Indus cities (brick houses, a citadel with a stepped bath, covered street drains, a bullock cart, the river) · 628 zero (night, a stepped temple tower, a scholar by an oil lamp setting the digits on a slate one by one, 0 last) · 1632 the Taj Mahal (dome, four minarets, reflecting pool with fountains, visitors) · 1858 Crown rule (monsoon rain, a clock tower and arcade, umbrellas) · 1930 the Salt March (walkers with staffs along the shore, salt heaps, surf, palms) · 1947 midnight (a sandstone fort wall with domed pavilions, lamps, fireworks one after another) · 2023 the Moon's south pole (grey ground, lander, rover rolling out, Earth in a black sky) · today (towers at dusk, an elevated metro, auto-rickshaws, kites) · the wall of prints.

Engine additions: `zero: true` on an era replaces its squeegee with the brush ring (film.js `zeroWipe`; 1.2 s sweep); `pause` on an era holds the narration that long before its line (timeline.py) so a signature can play in silence; `cold.arc` bends the cold-open camera path sideways; `space: true` in scenes.js drops the base landscape (the Moon). The last print now lands just before "Today" is spoken.

Voice notes: whisper writes "Brahmagupta" as "Brahma Gupta" (the phonemes are right: bɹˈɑːmɐɡˌʊptə), so `asr` says "Brahma Gupta" and the subtitle keeps the real spelling. "Shah Jahan", "Taj Mahal", "Indus", "Gandhi" all pass. No "live" (the Today line says "call India home").
