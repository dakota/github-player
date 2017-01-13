# github-player
Simple NodeJS app to play sounds when a github label is attached to an issue, or when a pull request is merged

# Installation

Clone, and run `npm install`

# Configuration

See `config/default.json` for available config keys

# Usage

Create a text file in `soundLists/label` with a slugged name for the label (i.e. lowercase and dashed). Inside this sound be sound clip filenames (Relative to the `sounds/` directory).
A random one will be played when that label is added to an issue.

Likewise, create a text file in `soundLists/merged` with a slugged name of the base branch. The sounds in this file will be played when a pr is merged into the respective base branch.

To run, simply run `node main.js`
