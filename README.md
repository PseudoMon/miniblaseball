# MiniBlaseball Website
Hullo! This repository contains the code that runs the [#MiniBlaseball website](https://miniblaseball.surge.sh). If you see any functional bugs or if you want to suggest new features, feel free to open an issue! Feel free to also contact me on [Twitter](https://twitter.com/PseudoMonious). 

The website is built with [Svelte](https://svelte.dev), utilizing single-page routing with [Svelte Navigator](https://github.com/mefechoel/svelte-navigator). Data for the players is handwritten in the filename and in a metadata file which is written using the [Eno notation language](https://eno-lang.org/). These data is then collated with some Python scripting and exported into a JSON which is then loaded into the app.

I've no plans to further automate data processing or to add more data into the site e.g. star rating, but I'm open if you want to develop it.  

Note that this repository does not contain the images!

## Requirements
If you want to run the scripts that generate players data, you'll need Python 3 with the Python enolib package and the Pillow package installed.

For the website itself, you just need a not-too-old version of Node and a Node package manager. I use PNPM, but it should work the same way if you use NPM or other package manager that uses the same package.json format.

## Generating player data
You can find the generated players data in `src/players.json` and `src/guestPlayers.json`. Team data can be found in `src/teams.json` and `src/guestTeams.json`. 

To generate this data, run

```
python dist/scripts/processplayers.py
```

Players's names, sprites, and team are determined from the images and their filename. Size determination is done programmatically, except for, specifically, Morrow Doyle and Adkins Gwiffin, which are hardcoded inside `processplayers.py`. Credits metadata is written in `dist/scripts/extradata.eno`

Note that `extradata.eno` may also contains some teams data that are no longer used or updated. Vestiges from a previous version of the site.

Image filename should be in the format e.g. `0111ChorbyShort_Magic.png`, with alt designs being e.g. `0111ChorbyShort2_Magic.png`. Mind the number of digits. Team name for the sprite MUST be included. 

Guest teams still uses the old formula e.g. G`001BreezeRegicide.png`

We use UTF-8 encoding, so non-English letters should work as well (thanks for reminding me, Jesús Koch). 

A player's "size" decides where the cut-off will be when viewing the player's page. Most players are probably `small`, some are `large`, and for a couple few, they need to be slightly larger than large: `xlarge`. The maximum is Peanutiel Duffy's `huge`.

Teams' full name data are contained inside `teams.eno`.

## Running the website on your machine
Install the requirements with this (or however your package manager install packages).

```
pnpm install
``` 

And then simply run this

```
pnpm run dev
```

Replace pnpm with npm or whatever package manager you have. If you don't use PNPM, in `rollup.config.js`, find and replace the word `pnpm` with the package manager you use (e.g. `npm`).

That script will run a server running in `localhost:5000`. The page will reload automatically whenever any of the code changes.

Note that players data (e.g. `players.json`) will still have to be rebuilt through the Python script whenever there are new players or changes to `extradata.eno`. 


## The website's source code
Source code that pertains to the site (as opposed to the data) are all inside the `src` folder. Most of the processing happens in the main `app.svelte`. 

Machine-readable players data is contained within `players.json`, which should be generated by the Python script. `teams.json` contains the teams divided by subleagues, to be displayed in the filter menu. Both these files should be created through the Python script.

`teamsReverseId.js` contain codes that flatten that teams JSON into a single array, and then transform that array into an object in which team names become keys and their values is their index within that array. It's for sorting by teams, so we can compare their team index.

## Readying for production
Run this script (or the equivalent with your package manager):

```
pnpm run build
```

This will result in minified production-ready files in the `dist` folder.

The current website is hosted on [Surge.sh](https://surge.sh)! If you have upload rights, you can go to the `dist` folder and upload using 
```
surge --domain miniblaseball.surge.sh
```

We also occasionally use the domain `zion-aliciakeyes.surge.sh` for testing new features.

Note the existence of `200.html` file which is identical to `index.html`. When using Surge.sh, [this will enable client-side routing](https://surge.sh/help/adding-a-200-page-for-client-side-routing). 

## This repo is not always updated when I add new players
The miniblaseball site should always have the latest version though. As a bonus, you can access the latest extradata directly at http://miniblaseball.surge.sh/scripts/extradata.eno. 