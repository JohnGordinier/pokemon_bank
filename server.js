import express from "express";
import pg from "pg";

const client = new pg.Client({
  database: "pokemon_collection",
});

await client.connect();
console.log("Welcome to my Pokemon database");

//THIS QUERY WILL SORT THE POKEMON CARDS FROM THE HIGHEST VALUE DESCENDING
const result = await client.query("SELECT * FROM cards ORDER BY value DESC;");
const totalValue = await client.query(
  "SELECT SUM(value) AS total_value FROM cards;"
);
console.log("Query result:", result.rows);
console.log("TOTAL VALUE OF CARDS ARE: $", totalValue.rows[0].total_value);

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  console.log("Request received", req.method, req.url);
  next();
});

//TO GET A LIST OF ALL THE CARDS IN THE DATABASE
app.get("/cards", async (req, res) => {
  try {
    //THE GET QUERY WILL PUT THE CARDS IN ORDER BY VALUE DESCENDING
    const result = await client.query(
      "SELECT * FROM cards ORDER BY value DESC"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(
      "Error fetching the Pokemon Card, you gotta catch them all!",
      error
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//TO QUERY A CERTAIN CARD IN THE DATABASE BY CARD ID
app.get("/cards/:id", async (req, res) => {
  const cardID = req.params.id;

  try {
    // Fetch the Pokemon card by ID
    const result = await client.query("SELECT * FROM cards WHERE id = $1", [
      cardID,
    ]);

    // Check if any rows were returned
    if (result.rows.length === 0) {
      // Send 404 status and JSON with error message
      return res.status(404).json({
        error: "Pokemon card not found, are you sure you caught this one?",
      });
    }

    // Send the query result as JSON
    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching card:", error);
    // Send 500 status and JSON with error message
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//TO PUT A NEW POKEMON CARD INTO THE DATABASE
app.post("/cards", async (req, res) => {
  const year = Number.parseInt(req.body.year);
  const name = req.body.name;
  const value = Number.parseInt(req.body.value);
  const grade = req.body.grade;

  // Validate input
  if (!grade || !name || Number.isNaN(year) || Number.isNaN(value)) {
    console.log("Error, not a valid Pokemon card input. Please try again.");
    return res.sendStatus(400);
  }

  try {
    //THIS QUERY WILL RETURN THE INFORMATION BACK TO THEM INCLUDING THE NEW CARD ID
    const result = await client.query(
      "INSERT INTO cards (year, name, value, grade) VALUES ($1, $2, $3, $4) RETURNING *",
      [year, name, value, grade]
    );

    // The result.rows[0] now contains the new Pokemon Card details, including the ID
    const newCard = result.rows[0];

    // Send the inserted card as JSON, including the ID
    res.status(201).json(newCard);
  } catch (error) {
    console.error("Error adding Pokemon card:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//TO MAKE A CHANGE TO A POKEMON CARD'S INFORMATION IN THE DATABASE
app.put("/cards/:id", async (req, res) => {
  const cardID = req.params.id;
  const year = Number.parseInt(req.body.year);
  const name = req.body.name;
  const value = Number.parseInt(req.body.value);
  const grade = req.body.grade;

  // Validate input
  if (!year || !name || Number.isNaN(year) || Number.isNaN(value)) {
    console.log("Error: Invalid Pokemon card input");
    return res.sendStatus(400);
  }

  try {
    // Update the Pokemon card
    const result = await client.query(
      "UPDATE cards SET year = $1, name = $2, value = $3, grade = $4 WHERE id = $5 RETURNING *",
      [year, name, value, grade, cardID]
    );

    // Check if any rows were affected
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Card not found" });
    } else {
      // Send the updated card as JSON
      res.json(result.rows[0]);
    }
  } catch (error) {
    console.error("Error updating card:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//TO DELETE A POKEMON CARD FROM THE DATABASE
app.delete("/cards/:id", async (req, res) => {
  const id = req.params.id;
  try {
    // Check if any rows were affected
    if (result.rowCount === 0) {
      res.status(404).json({ error: "Pokemon card not found" });
    } else {
      res.sendStatus(204);
    }
  } catch (error) {
    console.error("Error deleting Pokemon card:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//PORT IS LISTENING FOR A REQUEST
app.listen(8000, () => {
  console.log("listening on port 8000");
});
