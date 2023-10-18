import http from "http";
import fs from "fs";

let server = http.createServer((req, res) => {
  const pokemonRegExp = /^\/cards\/(.*)$/; // regular expressions to check for /cards/0, cards/1, etc
  console.log(req.url);
  if (req.method === "GET" && req.url === "/cards") {
    fs.readFile("../cards.json", "utf-8", function (error, text) {
      // Read cards from pets.json
      // if readFile produces an error, generate status code 500 (internal server error)
      if (error) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("Internal Server Error");
        console.error(err.stack);
        return;
      }
      console.log("get all Pokemon cards.");
      // parse json to an object (array)
      const cards = JSON.parse(text);

      // Return cards as response
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(cards));
    });
  } else if (req.method === "GET" && petRegExp.test(req.url)) {
    // if readFile produces an error, generate status code 500 (internal server error)
    fs.readFile("../cards.json", "utf8", (err, cardsJSON) => {
      if (err) {
        console.error(err.stack);
        res.statusCode = 500;
        res.setHeader("Content-Type", "text/plain");
        res.end("Internal Server Error");
        return; // stop callback here so Node doesn't try to use cardsJSON
      }
      // assume no file read error
      const cards = JSON.parse(cardsJSON);
      // match the request URL with the pets/... pattern
      const matches = req.url.match(cardRegExp);
      // grab the number from the matched URL array
      const petIndex = Number.parseInt(matches[1]);
      // ensure we have a number, and its in range - if not generate status code 404
      if (
        cardIndex < 0 ||
        cardIndex >= cards.length ||
        Number.isNaN(cardIndex)
      ) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Card not Found. Are you sure you caught this one");
        return; // stop callback before using cardIndex
      }

      // use cardIndex to get specific card from cards.json
      console.log("Pokemon card index: ", cardIndex);
      // Stringify the card
      const cardJSON = JSON.stringify(cards[cardIndex]);
      // set response status code
      res.statusCode = 200;
      // set content type and stringified json to response body
      res.setHeader("Content-Type", "application/json");
      res.end(cardJSON);
    });
  } else {
    res.statusCode = 404;
    res.end("Not Found");
  }
});

server.listen(8000);
