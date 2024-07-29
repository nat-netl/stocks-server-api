const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

require("dotenv").config();
const app = express();
const port = process.env.PORT || 8000;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection({
  host: "dpg-cqjmteij1k6c739vgv20-a",
  user: "main_6y1g_user",
  database: "main_6y1g",
  password: "XfbQOLYDiL1Pzyu1SMNEnJDKg2o0OwpI",
});

app.get("/", (req, res) => {
  res.json({
    success: 1,
    message: "Json",
  });
});

// Все акции и пагинация
app.get("/stocks", (req, res) => {
  const { page, limit } = req.query;
  const offset = (page - 1) * limit;
  let sql = "SELECT count(*) as count FROM stocks";

  db.query(sql, (err, data) => {
    if (err) return res.json({ message: "Error: " + err });

    const totalPage = Math.ceil(+data[0]?.count / limit)
    console.log (totalPage)
    sql = `SELECT * FROM stocks`;

    db.query(sql, (err, data) => {
      if (err) return res.json({ message: "Error: " + err });
      return res.json({data, pagination: {page: +page, limit: +limit, totalPage} });
    });
  });
});

// Добавиление акции
app.post("/add_stock", (req, res) => {
  sql =
    "INSERT INTO stocks (`name`, `quantity`, `days_receive_gift`, `days_receipt_gift`, `description`, `card_numbers`, `date`) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const date = new Date().toLocaleDateString();

  const values = [
    req.body.name,
    req.body.quantity,
    req.body.days_receive_gift,
    req.body.days_receipt_gift,
    req.body.description,
    req.body.card_numbers,
    date,
  ];

  db.query(sql, values, (err, data) => {
    if (err) return res.json({ message: "Error: " + err });
    return res.json({ success: "Succes added stock" });
  });
});

// Получение акции по id
app.get("/stock/:id", (req, res) => {
  const id = req.params.id;
  const sql = "SELECT * FROM stocks WHERE `id`= ?";

  db.query(sql, [id], (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Изменение акции
app.post("/edit_stock/:id", (req, res) => {
  const id = req.params.id;
  const sql =
    "UPDATE stocks SET `name`=?, `quantity`=?, `days_receive_gift`=?, `days_receipt_gift`=?, `description`=?, `card_numbers`=?, `edit_date`=? WHERE id= ?";
  const edit_date = new Date().toLocaleDateString();

  const values = [
    req.body.name,
    req.body.quantity,
    req.body.days_receive_gift,
    req.body.days_receipt_gift,
    req.body.description,
    req.body.card_numbers,
    edit_date,
    id,
  ];

  db.query(sql, values, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

//Удаление акции
app.delete("/delete_stock/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM stocks WHERE id= ?";

  const values = [id];

  db.query(sql, values, (err, data) => {
    if (err) return res.json(err);
    return res.json(data);
  });
});

// Поиск
app.get("/search", (req, res) => {
  const searchTerm = req.query.term;

  if (!searchTerm) {
    return res.status(400).json({ error: "Search term is required" });
  }

  const query = `
    SELECT * FROM stocks
    WHERE name LIKE ? 
  `;

  const searchValue = `%${searchTerm}%`;

  db.query(query, [searchValue, searchValue], (err, data) => {
    if (err) {
      console.error("Error executing search query:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    res.json({data});
  });
});

app.listen(port, () => {
  console.log(port);
});
