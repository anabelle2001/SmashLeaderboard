
let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs')

let USERS = JSON.parse(fs.readFileSync("./data/users.json"));
let BATTLES = JSON.parse(fs.readFileSync("./data/battles.json"))

app.use(express.urlencoded())
app.listen(8080);


app.get('/', function (req, res) { res.sendFile(path.join(__dirname + '/html/index.html')) });
app.get('/addUser', function (req, res) { res.sendFile(path.join(__dirname + '/html/addUser.html')) });
app.get('/addBattle', function (req, res) { res.sendFile(path.join(__dirname + '/html/addBattle.html')); });
app.get('/listUsers', function (req, res) { res.sendFile(path.join(__dirname + '/html/listUsers.html')); });
app.get('/listBattles', function (req, res) { res.sendFile(path.join(__dirname + '/html/listBattles.html')); });
app.get('/main.css', function (req, res) { res.sendFile(path.join(__dirname + '/html/main.css')); });
app.get('/populateCompetitorDropdown.js', function (req, res) { res.sendFile(path.join(__dirname + '/html/populateCompetitorDropdown.js')); });
app.get('/favicon.ico', function (req, res) { res.sendFile(path.join(__dirname + '/html/favicon.ico')); });
app.get('/icon.png', function (req, res) { res.sendFile(path.join(__dirname + '/html/icon.png')); });

app.get('/data/users',function (req,res) {
  res.send(JSON.stringify(USERS))
})
app.get('/data/battles', function (req, res) {
  res.send(JSON.stringify(BATTLES))
})

app.post("/data/addUser", function (req,res) {
  let {firstName,lastName} = req.body
  USERS.push({
    firstName,
    lastName,
    id:USERS.length,
    rank:400,
    games:0,
  })
  fs.writeFile('./data/users.json', JSON.stringify(USERS), (err) => { if (err) throw err; else console.log("updated users.json")})
  res.send('User has been added <a href="/addUser">Go Back</a>')
})

app.post("/data/addBattle", function (req,res) {
  let {userA,userB,outcome} = req.body;
  USERS[userA].games++;
  USERS[userB].games++;
  BATTLES.push({
    userA,
    userB,
    outcome,
    date: new Date(),
  })
  Elo(USERS[userA],USERS[userB],outcome)
  fs.writeFile('./data/battles.json', JSON.stringify(BATTLES), (err) => { if (err) throw err; else console.log("updated battles.json")})
  res.send(`Battle has been added and ELO has been updated <a href="/addBattle">Go Back</a>`)
})

function Elo(p1, p2, outcome) {
  let K = 100

  let p1winprob = probability(p1.rank, p2.rank)

  let differential = Math.floor(K * (p1winprob - outcome))

  p1.rank += differential
  p2.rank -= differential
}

function probability(r1, r2) {
  return 1.0 * 1.0 / (1 + 1.0 * Math.pow(10, 1.0 * (r1 - r2) / 400))
}