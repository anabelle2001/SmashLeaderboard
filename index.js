const crypto = require('crypto');
let express = require('express');
let path = require('path');
let fs = require('fs')
let APP = express();
APP.use(express.urlencoded())

//https redirect
express().get('*', function (req, res) {
  res.redirect('https://' + req.headers.host + req.url);
}).listen(80);



//THIS IS GLITCHED FOR SOME REASON
let https = require("https")
let options = {
  key: fs.readFileSync('secrets/server.key', 'utf8'),
  cert: fs.readFileSync('secrets/server.crt', 'utf8')
};
let httpsServer = https.createServer(options, APP) 
httpsServer.listen(443);

const K = 100;


let USERS = JSON.parse(fs.readFileSync("./data/users.json"));
let BATTLES = JSON.parse(fs.readFileSync("./data/battles.json"))



APP.get('/', function (req, res) { res.sendFile(path.join(__dirname + '/resources/index.html')) });


let mapping = [
  {
    web: '/addUser',
    file: '/resources/addUser.html'
  },
  {
    web: '/addBattle',
    file: '/resources/addBattle.html'
  },
  {
    web: '/listUsers',
    file: '/resources/listUsers.html'
  },
  {
    web: '/listBattles',
    file: '/resources/listBattles.html'
  },
  {
    web: '/main.css',
    file: '/resources/main.css'
  },
  {
    web: '/populateCompetitorDropdown.js',
    file: '/resources/populateCompetitorDropdown.js'
  },
  {
    web: '/downloadObjects.js',
    file: '/resources/downloadObjects.js'
  },
  {
    web: '/favicon.ico',
    file: '/resources/favicon.ico'
  },
  {
    web: '/icon.png',
    file: '/resources/icon.png'
  },
  {
    web: '/editUser',
    file: '/resources/editUser.html'
  },
]

mapping.forEach(page=>{
  APP.get(
    page.web, 
    function (req, res) {
      res.sendFile(path.join(__dirname + page.file))
    }
  );
})

APP.get('/data/users',function (req,res) {
  res.send(JSON.stringify(USERS))
})
APP.get('/data/battles', function (req, res) {
  res.send(JSON.stringify(BATTLES))
})

APP.post("/data/addUser", function (req,res) {
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

APP.post("/data/addBattle", function (req,res) {

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

APP.post("data/editUser",function (req,res) {
  //authenticate
  //
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

function isAuthentic(userID,password){
  if(userID.salt && userID){
    
  }
  //TODO:
}

function SHA256(secret,salt){
  return crypto.createHash('sha256')
    .update(secret,'utf8')
    .digest('base64')
}