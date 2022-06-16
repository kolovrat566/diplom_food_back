const express = require("express");
const { createProxyMiddleware } = require('http-proxy-middleware');
const { Pool } = require("pg");
const pool = new Pool({
  user: "postgres",
  password: "root",
  host: "localhost",
  port: 5432,
  database: "Users"
})

const PORT = 8080;
const app = express();

app.use(express.urlencoded());
app.use(express.json());
app.use('/app/', createProxyMiddleware({
  target: 'http://localhost:3000',
  changeOrigin: true,
}));

  

app.post('/addUser/', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const user = Object.values(JSON.parse(Object.keys(req.body)));
  let contraindicationsId = await pool.query(`SELECT id FROM Contraindications WHERE contraindications='${user[4]}'`);

  if (contraindicationsId?.rows[0]?.id == undefined) {
    contraindicationsId = await pool.query(`SELECT max(id) from Contraindications`);
    await pool.query(`INSERT INTO Contraindications (id, contraindications) values ($1, $2)`, [+contraindicationsId.rows[0].max + 1, user[4]]);
  };

  const newContraindicationsId = contraindicationsId?.rows[0]?.id == undefined ? +contraindicationsId.rows[0].max + 1 : +contraindicationsId.rows[0].id;

  const id =  await pool.query(`SELECT max(id) from Users`);
  await pool.query(`INSERT INTO Users (id, firstName, lastName, patronymic, phone, address, selectedRation, selectedDaysActive, selectedCountDaysActive, contraindications_id) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`, [id.rows[0].max + 1, ...user.slice(0, 5), ...user.slice(6, user.length), newContraindicationsId]);
  res.json('successfully');
  res.status(200);
})

app.post('/addCallback/', async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");
  const addCallback = Object.values(JSON.parse(Object.keys(req.body)));
  const id =  await pool.query(`SELECT max(id) from Callbacks`);
  await pool.query(`INSERT INTO Callbacks (id, firstName, dateCalls, phone) values ($1, $2, $3, $4)`, [id.rows[0].max + 1, ...addCallback]);
  res.status(200);
  res.json('successfully');
})

app.get('/getMenu/', async (req, res) => {
  const food = await pool.query(`SELECT * FROM Food`);
  res.header("Access-Control-Allow-Origin", "*");
  console.log(food.rows);
  res.status(200);
  res.json(food.rows);
});

app.listen(PORT, () => console.log('PORT' + PORT));