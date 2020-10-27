# MiniBlaseball Website
Hullo, this repository is for the code that runs the #MiniBlaseball website. I wrote this readme to my future self so I don't get lost if I want to get back to this, and well, I guess anyone who want to help fix bugs, or is learning frontend development!

This website is built with Riot and Rollup. It's designed to only run only in the frontend from a single file and a single address. I use some Python scripting to grab and collate metadata for each players, which is exported into a json and then into the app.

Note that this repository does not contain the images! The website WILL look broken and you won't be able to run the Python scripts without them.

## Requirements
A Node package manager. I use PNPM, but it should work the same way if you use NPM or other package manager that uses the same package.json format.

If you want to run the scripts that generate players data, you'll need Python 3.

Something to run a server. I use Python's builtin simple server.  

## Running on your machine
Install with this (or however your package manager install).

```
pnpm install
``` 

And then run rollup from the configuration file

```
rollup -c -w
```

That will put all the JavaScript source code into an `app.js` file in the dist folder, which is then read by `index.html` when you open it. You can just open that file straight, but the website functions rely on being run from a server, so you'll have to run a server based on that directory. I use Python, so I can just run this 

```
python -m http.server
```

