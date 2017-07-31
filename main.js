var fs = require('fs');
var player = require('play-sound')(opts = {});
var slug = require('slug');
var config = require('config');
var Util = require('util');

var http = require('http')
var createHandler = require('github-webhook-handler')
var ghHandler = createHandler({ path: config.get('ghPath'), secret: config.get('secret') });
var bl = require('bl');
var querystring = require('querystring');
var accentMap =   {
    british: "En-gb",
    american: "En-us",
    french: "Fr",
    german: "De",
    russian: 'Ru',
    spanish: 'es',
    italian: 'it'
  };

function playRandomSound(sourceFile)
{
  var fileName = 'soundLists/' + sourceFile.toLowerCase();
  if (!fs.existsSync(fileName)) {
    console.log(Util.format('%s sound list does not exist', fileName));
    return;
  }

  fs.readFile(fileName, 'utf8', function (err,data) {
    var lines = data.split('\n');
    var soundFile = lines[Math.floor(Math.random()*(lines.length - 1))];

    console.log(Util.format('Playing %s from the %s list', soundFile, sourceFile));
    player.play('sounds/' + soundFile, function(err){
        if (err) {
            console.log(err);
        }
    });
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

var httpServer = http.createServer(function (req, res) {
  function hasError (msg) {
    res.writeHead(400)
    res.end(msg)
  }

  if (req.url.split('?').shift() === config.get('speakPath') && req.method === 'POST') {
    req.pipe(bl(function (err, data) {
      var volume = config.get('volume');
      var accent = 'En-gb';
      var text = '';

      function command(command, value) {
        command = command.toLowerCase();
        value = value ? value.toLowerCase() : value;
        switch (command) {
          case 'help':
          case 'h':
            res.end('Options available are [accent|a: en-gb|en-us|de|fr|it|es|ru], [volume|v: 0 to 20]');
            break;
          case 'accent':
          case 'a':
            accent = value;
            if (accentMap[accent]) {
              accent = accentMap[accent];
            }
            break;
          case 'volume':
          case 'v':
            volume = parseInt(value);
            if (volume >= 20) {
              volume = 10;
            }
            break;
          default:
            res.end('Invalid option, try [help] for a list of valid ones');
            break;
        }
      }

      try {
        obj = querystring.parse(data.toString())
      } catch (e) {
        return hasError(e.msg)
      }

      if (obj.token !== config.get('token')) {
        return hasError('Invalid token');
      }

      text = obj.text;

      var regex = /\[(accent|a|v|volume|help|h)(?:\: ([a-z0-9A-Z-]*))?\]/gi;
      text = text.replace(regex, function (match, g1, g2) {
        command(g1, g2);
        return '';
      }).trim();

      var request = {
        ie: 'UTF-8',
        client: 'tw-ob',
        q: text,
        tl: accent
      };
      console.log('Speak received');
      player.play('http://translate.google.com/translate_tts?' + querystring.stringify(request), {player: 'mplayer', mplayer: ['-af', 'volume=' + volume]});

      res.statusCode = 200;
      res.end('Your words will be spoken.');
    }));

    return;
  }

  ghHandler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  });
});

var playSoundHandler = function (type, reference) {
  var fileName = slug(reference, {lower: true});
  console.log('Will be playing sounds for ' + type + ' with reference ' + reference);
  playRandomSound(type + '/' + fileName);
}

ghHandler.on('issues', function (event) {
  var data = event.payload;

  if (data.action && data.action === 'labeled') {
    playSoundHandler('label', data.label.name);
    return;
  }
});

ghHandler.on('pull_request', function (event) {
  var data = event.payload;

  if (data.action && data.action === 'closed' && data.pull_request && data.pull_request.merged === true) {
    playSoundHandler('merged', data.pull_request.base.ref);
    return;
  }

  if (data.action && data.action === 'labeled') {
    playSoundHandler('label', data.label.name);
    return;
  }
});

initialise();
httpServer.listen(config.get('port'), config.get('host'), function() {
  console.log('Listening now');
});
