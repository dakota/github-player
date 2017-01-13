var githubhook = require('githubhook');
var fs = require('fs');
var player = require('play-sound')(opts = {});
var slug = require('slug');
var config = require('config');
var Util = require('util');

var github = githubhook(config.get('GitHub'));

function playRandomSound(sourceFile)
{
  var fileName = 'soundLists/' + sourceFile
  if (!fs.existsSync(fileName)) {
    return;
  }

  fs.readFile(fileName, 'utf8', function (err,data) {
    var lines = data.split('\n');
    var soundFile = lines[Math.floor(Math.random()*lines.length)];
  
    console.log(Util.format('Playing %s from the %s list', soundFile, sourceFile));
    player.play('sounds/' + soundFile);
  });
}

function initialise()
{
  if (!fs.existsSync('soundLists/')) {
    fs.mkdirSync('soundLists/');
  }

  if (!fs.existsSync('sounds/')) {
    fs.mkdirSync('sounds/');
  }
}

github.on('issues', function (repo, ref, data) {
  if (!data.action || data.action !== 'labeled') {
    return;
  }

  var label = data.label.name;
  var fileName = slug(label);
  playRandomSound('label/' + fileName);
});

github.on('pull_request', function (repo, ref, data) {
  if (!data.action || data.action !== 'closed') {
    return;
  }

  if (!data.pull_request || data.pull_request.merged !== true) {
    return;
  }

  var baseBranch = data.pull_request.base.ref;
  var fileName = slug(baseBranch);

  playRandomSound('merged/' + baseBranch);
});

initialise();
github.listen();
