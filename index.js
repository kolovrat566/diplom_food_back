import express from "express";

const PORT = 8080

const app = express()

app.use(express.urlencoded())
app.use(express.json())

app.post('/addUser/', (req, res) => {
  console.log(JSON.parse(Object.keys(req.body)));
  res.status(200)
})

app.listen(PORT, () => console.log('PORT' + PORT))