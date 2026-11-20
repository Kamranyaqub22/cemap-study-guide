# France in 60 Seconds — Treatment

Series: History in 60 Seconds (@PrintedHistory) · Silkscreen Travel Poster · 1080×1920, 24 fps, 56.3 s.

| | Greece | Mexico | France |
|---|---|---|---|
| Hook | a myth first | a hidden-city mystery | **"imagine"** — puts the viewer in the scene ("Imagine painting a cave wall by firelight, 36,000 years ago. France's story starts there.") |
| Cold open | spiral out | spring pull-back | **a torch reveal**: close on the cave wall in a flickering pool of light that drifts across the paintings and widens to the whole print while the camera eases out; the title is printed in light ink so it reads in the dark from frame one |
| Base | the Aegean | agave fields | **Provence**: rows of lavender running to the horizon, a stone farmhouse, vineyard terraces on blue hills, round plane trees swaying, long cloud streaks, a sun with a turning ring of rays, swallows swinging |
| Signature | boustrophedon wipe | papel picado | **the wall comes down**: in 1789 the old print turns into a wall of stone blocks that shiver and fall row by row, top first, and the new print (the fortress and the crowd) stands behind it; it plays in its own pause |
| Silence | 1460 | 1521 | 52 BC: the music stops on "defeats"; one low cello note fades over the siege works |
| Comeback | 1830 | 1810 | 1789: a timpani roll swells as the blocks fall and a full tutti chord lands with the last one; the key turns major |
| Instruments | bouzouki, lyra, 7/8 | marimba, guitar, sesquiáltera | **harpsichord, string ensemble (violins, violas, cellos, pizzicato basses), timpani** — real samples (CC0) — in a **3/4 minuet**; D Dorian → D major from 1789 |
| Ending | "Would you have voted?" | "Have you been to Mexico?" | **"Which print is your favourite? Tell us below."** — card "FAVE / PRINT?" over the wall of prints |

Eras: c. 34,000 BC the Chauvet cave (horses, a lion and a rhino in charcoal and ochre, hand stencils, dots, torches, drips) · 52 BC Alesia (the hilltop town, smoke, the ring of stakes and towers, a marching column, crows) · 800 Charlemagne (an eight-sided domed chapel and its tower, a crown under a slowly turning ring of light, riders) · 1429 Orléans (a walled river city, a bridge, a rider with a long pennant leading a column) · 1682 Versailles (the long garden front, gilded roofline, fountains leaping, a coach and horses) · 1789 the Bastille (round towers, smoke, a crowd with pikes and hats) · 1889 the Eiffel Tower (rising stage by stage, a beacon sweeping, a balloon, a crowd with umbrellas) · today (mansard roofs and chimneys, twin cathedral towers, a white dome on the hill, a riverboat, cyclists) · the wall of prints.

Engine changes: `cold.torch` [x0, y0, x1, y1, zoom] (film.js); `blocks: true` (film.js `blocksWipe`, 1.2 s sweep in a 1.1 s pause; timeline.py treats it like the other signature wipes); `headerInk` takes an ink override; prints swing a little more on the end wall (it was the stillest stretch); the score uses recorded samples through `core/audio/sampler.py` (the sample libraries download themselves the first time).

Voice notes: Kokoro says "Charlemagne" as /tʃɑːlɪmaɡnɪ/, "Chauvet" as /ʃəʊvɪt/ and "Versailles" as /vɜːseɪlz/: the voice text spells them "Sharlemain", "Show-vay" and "Vair-sigh" (whisper writes the real names back). "Orléans" came back as "all aliens": the line says "the city of Orleans" (/ɔːliənz/). A line ending on a sibilant ("rhinos") put hiss into the 52 BC sweep (the silence era's sweep starts early): it now ends "and a rhino". No "live".
