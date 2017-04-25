var keys = require("./keys");
var fs = require("fs");
var twitter = require("twitter");
var spotify = require("spotify");
var request = require("request");

var client = new twitter(keys.twitterkeys);

function LIRI(method, param)
{
  switch(method)
  {
    case "my-tweets":
      //show your last 20 tweets and when they were created at in your terminal/bash window.
      var params = {screen_name: "trcanderson"};
      client.get("statuses/user_timeline", params, function(error, tweets, response) {
        if(!error)
        {
          var appendString = ``;
          for(var i = 0; i < 20; i++)
          {
            appendString += `${tweets[i].created_at}: ${tweets[i].text}
`;
          }
          fs.appendFile("log.txt", appendString, function(error) {
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log(appendString);
            }
          });
        }
        else
        {
          console.log(error);
        }
      });
      break;
    case "spotify-this-song":
      //show the following information about the song in your terminal/bash window:
      //Artist(s), The song's name, A preview link of the song from Spotify, The album that the song is from
      //default: "The Sign", Ace of Base
      spotify.search({type: "track", query: (param || "The Sign Ace of Base")}, function(error, data) {
        if(error)
        {
          console.log(error);
        }
        else
        {
          var artistsList = "";
          for(var i = 0; i < data.tracks.items[1].artists.length; i++)
          {
            artistsList += data.tracks.items[1].artists[i].name;
            if(i < data.tracks.items[1].artists.length - 1)
            {
              artistsList += ", "
            }
          }
          var songInfo = {
            artists: artistsList,
            song: data.tracks.items[1].name,
            link: data.tracks.items[1].preview_url,
            album: data.tracks.items[1].album.name
          }
          var appendString = `Artists: ${songInfo.artists}
Song: ${songInfo.song}
Link: ${songInfo.link}
Album: ${songInfo.album}
`;
          fs.appendFile("log.txt", appendString, function(error) {
            if(error)
            {
              console.log(error);
            }
            else
            {
              console.log(appendString);
            }
          });
        }
      });
      break;
    case "movie-this":
      //output the following information to your terminal/bash window:
      //Title of the movie, Year the movie came out, IMDB Rating of the movie, Country where the movie was produced, Language of the movie, Plot of the movie, Actors in the movie, Rotten Tomatoes Rating, Rotten Tomatoes URL.
      //default: Mr. Nobody
      var title = param || "Mr Nobody";
      var queryURL = "http://www.omdbapi.com/?t=" + title.trim().split(" ").join("+") + "&plot=short&r=json&tomatoes=true";
      request(queryURL, function(error, response, body) {
        if(!error)
        {
          body = JSON.parse(body);
          var ratingLookup = {};
          for (var i = 0, len = body.Ratings.length; i < len; i++)
          {
            ratingLookup[body.Ratings[i].Source] = body.Ratings[i];
          }
          var appendString = `Title: ${body.Title}
Year: ${body.Year}
IMDB Rating: ${ratingLookup["Internet Movie Database"].Value}
Country: ${body.Country}
Language: ${body.Language}
Plot: ${body.Plot}
Actors: ${body.Actors}
Rotten Tomatoes Rating: ${ratingLookup["Rotten Tomatoes"].Value}
Rotten Tomatoes URL: ${body.tomatoURL}
`
          fs.appendFile("log.txt", appendString, function(error) {
            if(!error)
            {
              console.log(appendString);
            }
            else
            {
              console.log(error);
            }
          });
        }
        else
        {
          console.log(error);
        }
      });
      break;
    case "do-what-it-says":
      //LIRI will take the text inside of random.txt and then use it to call one of LIRI's commands.
      fs.readFile("random.txt", "utf8", function(error, data) {
        if(!error)
        {
          var args = data.split(",");
          args[1] = args[1].substring(1, (args[1].length - 1));
          LIRI(args[0], args[1]);
        }
      });
  }
}

LIRI(process.argv[2], process.argv[3]);
