
let express = require('express');
let app = express();
let path = require('path');
let fs = require('fs')
const K = 100;

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
app.get('/downloadObjects.js', function (req, res) { res.sendFile(path.join(__dirname + '/html/downloadObjects.js')); });
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
  if(!firstName || !lastName){
    res.send("First or last name Empty")
    return
  }
  USERS.push({
    firstName,
    lastName,
    id:USERS.length,
    rank:400,
    games:[],
    wins:0,
  })
  SaveObjects()
  res.redirect("../listUsers")
})

app.post("/data/addBattle", function (req,res) {

  let {userA,userB,outcome} = req.body;

  if(userA == -1 || userB == -1 || userA == userB){
    res.send("what kindof a battle was that? one person fighting nobody but themself? i dunno what the hell to do with that?")
  }
  outcome = Number(outcome)

  let ua = USERS[userA]
  let ub = USERS[userB]

  ua.games.push(BATTLES.length)
  ub.games.push(BATTLES.length)

  if (outcome > 0.5){
    ua.wins++
  } else {
    ub.wins++
  }

  let userAoldELO = ua.rank
  let userBoldELO = ub.rank

  let predictedOutcome = probability(ua.rank,ub.rank)
  let differential = getDifferential(predictedOutcome,outcome)

  ua.rank += differential
  ub.rank -= differential

  BATTLES.push({
    id:BATTLES.length,
    date: new Date(),
    userA,
    userB,
    userAoldELO,
    userBoldELO,
    predictedOutcome,
    outcome,
    differential,
  })

  SaveObjects()
  res.redirect("../listBattles")
})

function getDifferential(predictedOutcome,outcome) {
  return Math.floor(K * (predictedOutcome - outcome))
}
function probability(r1, r2) {
  return 1.0 * 1.0 / (1 + 1.0 * Math.pow(10, 1.0 * (r1 - r2) / 400))
}

function SaveObjects() {
  console.log("Writing Objects to Disk");
  fs.writeFile('./data/users.json', JSON.stringify(USERS), (err) => { if (err) throw err; else console.log("updated users.json") })
  fs.writeFile('./data/battles.json', JSON.stringify(BATTLES), (err) => { if (err) throw err; else console.log("updated battles.json") })  
}