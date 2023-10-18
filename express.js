import fs from "fs promises";
import express from "express";

const app = express();
const port = 8000;
app.use(cards.json());

const loadPokemonData = () => {
  return fs.promises
    .readFile("../cards.json", "utf-8")
    .then((text) => {
      return JSON.parse(text);
    })
    .catch((error) => {
      console.error("Error loading Pokemon cards data:", error);
      process.exit(1);
    });
};

app.get("/cards", (req, res) => {
  loadPokemonData().then((pokemonData) => {});
});

app.get("/cards", (req, res) => {
  loadPokemonData()
    .then((pokemonData) => {
      res.json(pokemonData);
      console.log("Here is a list of all your cards. ", pokemonData);
    })
    .catch((error) => {
      console.error("Error reading Pokemon cards data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

app.get("/cards/:id", (req, res) => {
  const cardId = req.params.id;

  loadPokemonData()
    .then((pokemonData) => {
      const indexNum = Number.parseInt(cardId);

      if (
        !Number.isInteger(indexNum) ||
        Number.isNaN(indexNum) ||
        indexNum < 0 ||
        indexNum >= pokemonData.length
      ) {
        return res.status(400).json({ error: "Invalid Pokemon card ID" });
      }

      const card = pokemonData[indexNum];
      console.log("Here's the Pokemon card your inquiring about: ", card);
      res.json(card);
    })
    .catch((error) => {
      console.error("Error reading Pokemon card data:", error);
      res.status(500).json({ error: "Internal Server Error" });
    });
});

// endpoint to create a new Pokemon card
app.post("/cards", (req, res) => {
  // console.log("req.body", req.body);
  const year = Number.parseInt(req.body.year); // make sure its a number
  const name = req.body.name;
  const value = Number.parseInt(req.body.value);
  const grade = req.body.grade;
  // validate data from request body
  if (!name || !value || Number.isNaN(value) || Number.isNaN(year)) {
    console.log(
      "You have either entered an incorrect form of entry or you are missing an entry. Please try again."
    );
    return res.sendStatus(404); //This is a client error not a server error
  }
  // create a new Pokemon card object
  const newCard = {
    year: year,
    name: name,
    value: value,
    grade: grade,
  };
  console.log("newCard", newCard);
  // add to cards.json
  fs.readFile("../cards.json", "utf-8", (err, text) => {
    // read in cards.json
    if (err) {
      // send client internal sever error
      console.error(err.stack);
      res.sendStatus(500); //This is a server error
      return;
    }
    // parse text into json
    const cards = JSON.parse(text);
    // add new card
    cards.push(newCard);
    // write cards to cards.json
    fs.writeFile("../cards.json", JSON.stringify(cards), (err) => {
      if (err) {
        // send client internal sever error
        console.error(err.stack);
        res.sendStatus(500);
        return;
      }
      res.statusCode = 201;
      res.send(newCard);
    });
  });
});

app.listen(port, () => {
  console.log(`Pokemon app listening on port ${port}`);
});
