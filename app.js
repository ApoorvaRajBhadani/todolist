const express = require('express');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const path = require('path');
const fetch = require('node-fetch');
const expressAsyncHandler = require('express-async-handler');
const redis = require('redis');
require('dotenv').config();
//Database
const db = require('./config/database');
//Test DB
db.authenticate()
.then(()=> console.log('Database connected!'))
.catch(err=> console.log('Error: ' + err))

const REDIS_PORT = process.env.REDIS_PORT || 6379;
const client = redis.createClient(REDIS_PORT);

const app = express();
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));
app.use(express.static("public"));

app.get('/',(req,res)=>{
  fetch('http://localhost:3000/api/todos')
  .then(function(response){
      console.log(response.status);
      return response.json();
  })
  .then(function(json){
      //Set all todo items to redis
      for(var i=0;i<json.length;i++){
        client.setex(json[i].id,3600,json[i].desc);
      }
      res.render("list",{listTitle:"Today", newListItems: json});
  });
});

app.post("/",(req,res)=>{
  const body = {
      desc: req.body.newItem
  };
  fetch('http://localhost:3000/api/todos', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
  }).then(resp => resp.json())
    .then(json => {
      console.log(json);
      res.redirect("/");
    });
});

app.post("/delete",(req,res)=>{
  const id = req.body.checkbox;
  fetch('http://localhost:3000/api/todos/'+id, {
      method: 'DELETE',
  })
  .then(resp => res.redirect("/"))
});


// Cache middleware for specified todo item id
function cache(req,res,next){
  console.log("Hello from cache function");
  const id = req.params.id;
  client.get(id,(err,data)=>{
    if(err) throw err;
    if(data !== null){
      res.render("task",{taskid:id, taskdesc:data});
    }else next();
  })
}
app.get("/:id",cache,(req,res)=>{
  fetch('http://localhost:3000/api/todos/'+req.params.id)
  .then(function(response){
      //console.log(response.status);
      return response.json();
  })
  .then(function(json){
      //console.log(json);
      console.log("Hello from postgres respone");
      if(json.length) res.render("task",{taskid:json[0].id, taskdesc: json[0].desc});
      else res.send("No such item exists");
  });
});

app.post("/:id",(req,res)=>{
  const id = req.params.id;
  console.log("task : "+ id);
  res.redirect("/"+id);
});

app.post("/update/:id",(req,res)=>{
  const id = req.params.id;
  const desc = req.body.desc;
  const body = {
    desc: desc
  };
  fetch('http://localhost:3000/api/todos/'+id, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json'
      }
  }).then(resp => {
    client.setex(id,3600,desc);
    res.redirect("/"+id);
  })
});

//Todo API routes
app.use('/api/todos', require('./routes/todos'));

const PORT = process.env.PORT;
app.listen(PORT,()=>{
  console.log(`Server started on port ${PORT}`);
});
