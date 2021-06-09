const express = require('express');
const bodyParser = require('body-parser');
const router = express.Router();
const db = require('../config/database');
const Todo = require('../models/Todo');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
router.use(bodyParser.urlencoded({extended:true}));
//Create todo
router.post('/',(req,res)=>{
  const desc = req.body.desc;
  console.log("From post api");
  console.log(req.body);
  Todo.create({
    desc: desc
  })
    .then(todo => res.redirect('/api/todos'))
    .catch(err => console.log(err))
});

//Read all todos
router.get('/',(req,res)=>
  Todo.findAll()
  .then(todos => {
    //console.log(todos);
    res.send(todos);
  })
  .catch(err=> console.log(err))
);

//Read specified todo
router.get('/:id',(req,res)=>{
  const id = req.params.id;

  Todo.findAll({
    where:{
      id:id
    }
  })
  .then(todos => {
    //console.log(todos);
    res.send(todos);
  })
  .catch(err=> console.log(err))

});

//Update todo
router.put('/:id',(req,res)=>{
  const id = req.params.id;
  const desc = req.body.desc;

  Todo.update(
    { desc: desc},
    { where: { id: id}}
  )
  .then(updateResponse => {
      console.log(updateResponse);
      res.redirect('/api/todos');
    })
  .catch(err=> console.log(err))
});

//Delete specific todo
router.delete('/:id',(req,res)=>{
  const id = req.params.id;

  Todo.destroy({
    where:{
      id:[id]
    }
  })
  .then(todos => {
    console.log("Delete successful");
    res.redirect('/api/todos');
  })
  .catch(err=> console.log(err))

});

module.exports = router;
