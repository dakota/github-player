var githubhook = require('githubhook');
var fs = require('fs');
var player = require('play-sound')(opts = {});
var slug = require('slug');
var config = require('config');

var github = githubhook(config.get('GitHub'));

github.on('*', function (event, repo, ref, data) {
  if (!data.action || data.action !== 'labeled') {
    return;
  }

  var label = data.label.name;
  var fileName = slug(label);
  fs.readFile('labels/' + fileName, 'utf8', function (err,data) {
    if (err) {
        return console.log(err);
      }
    var lines = data.split('\n');
    var soundFile = lines[Math.floor(Math.random()*lines.length)];
  
    player.play('sounds/' + soundFile);
  });
});

github.listen();
