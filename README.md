# AoE4-Stream-Manager

NodeCG Based project to manage Rising Empires our Age of Empires 4 Streams.

[![Civ Draft 1v1](docs/civ-draft-example.png)](risingempires.gg)

### Features

- Civ Draft Graphic
  - Show banned and picked civs
  - Player or Team names (Can be shown in 2v2 Graphic)
  - Import Draft from aoe2cm.net
- Map display
  - Show up to 9 maps as a graphic
- Caster Manager
  - Very simple text to showcase who is casting
- Series Score Graphics
  - Extends Ingame Overlay to include a Score to show a Series Score
  - Minimap overlay to hide Playback Controls to prevent spoilers
  - "API"/HTTP Endpoints for StreamDeck usage

##### Civ Draft

The Civ Draft Module allows you too have a seperate screen to show the draft.
Drafts can be manually edited or;
Import finished drafts from aoe2cm.net. Sniped civs shows as banned on the opponents side. This is planned to be changed to better showcase the real draft.
Currently only a few presets are supported.
2v2 (and 3v3 & 4v4, although graphic might break or look weird) is supported to be used in our 2v2 Rising Empires League.
[![Civ Draft 2v2](docs/civ-draft-2v2-example.png)](risingempires.gg)

##### Map Display

Map Display is not fully implemented yet, but can be extended to show up to 9 maps in a line. The map in the middle is from this module.
New maps can easily be added or edited via the Assets tab from the browser.
[![Civ Draft 1v1](docs/civ-draft-example.png)](risingempires.gg)
Importing Map Draft from aoe2cm.net is on our Todo list, as well as adding a proper map draft to showcase who has home map. And what maps was won in a series.

##### Series Score

Adds a toggleable Graphic for displaying the series score and play amount(?)
Has fancy circles and "Between text" manually editable to be whatever. (Bo3, Pa3, Bo9, Moo, w.e)
Has an "API" or GET Endpoints for use with StreamDeck i.e.
Includes a toggleable "Spoiler Overlay" which hides the Playback Controls under the minimap in Caster Mode. As the Speed Up button gets highlighted when a game ends when spectating live.
[![Score Graphic](docs/score-display-example.png)](risingempires.gg)
| Endpoint | Function |
| ---- | ---- |
|`GET /score/toggleScore`|Toggles the Score Graphics|
|`GET /score/toggleSpoiler`|Toggles the Minimap/Spoiler Overlay|
|`GET /score/addLeft`|Adds 1 to the Left Side Score|
|`GET /score/addRight`|Adds 1 to the Right Side Score|
|`GET /score/swapScore`|Swaps the Left and Right Score|

##### Caster Manager

So you can edit casters name plate here instead of OBS. Yea thats it...

# Installation


### Todo

- Countdown timer
- ~~Integrate Aoe2cm Draft~~ (WebSockets or API) (API Done)

  - Add WebSockets for live drafts?
  - Add option to import names from aoe2cm aswell. Although not reliable name source since can be random things. And not very useful for Team Games
- 2v2 and 2v2 Improved Observer UI Graphics support

  - Need both normal and mod incase Mod breaks
  - Display team icons aswell?
  - Might need to save/load presets so you don't have to find the TeamLogo + Name all the time
- Show maps

  - Select Winner/Loser for map to overlay
  - Change to be per side?
    - Home maps, current played map in middle, etc
- Caster manager

  - Add Social Media handles?
