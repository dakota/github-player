# github-player
Simple NodeJS app to play sounds when a github label is attached to an issue

# Installation

Clone, and run `npm install`

# Configuration

See `config/default.json` for available config keys

# Usage

Create a text file in `labels/` with a slugged name for the label (i.e. lowercase and dashed). Inside this sound be sound clip filenames (Relative to the `sounds/` directory).
A random one will be played when that label is added to an issue/PR

To run, simply run `node main.js`
