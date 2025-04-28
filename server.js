// server.js
// A simple Express.js backend for a Todo list API

const express = require('express');
const path = require('path')
const app = express();
const port = 3000;
const sqlite3 = require("sqlite3").verbose();

// Middleware to parse JSON requests
app.use(express.json());

// Middle ware to inlcude static content
app.use(express.static('public'))

const db=new sqlite3.Database('Todo.db');

db.run(`CREATE TABLE IF NOT EXISTS todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL ,
  priority TEXT NOT NULL DEFAULT 'low',
  isComplete BOOLEAN NOT NULL,
  isFun BOOLEAN NOT NULL DEFAULT 1 
);`, (err)=>{
  if (err){
    console.error("Error creating table:");
  }
  console.log(" table created (if it didn't already exist).");
});


// In-memory array to store todo items

let nextId = 1;

// server index.html
app.get('/', (req, res) => {
    res.sendFile('index.html')
})

// GET all todo items
app.get('/todos', (req, res) => {
  db.all("SELECT * FROM todos",(err,rows) => {
    if (err){
      console.error(err.message);
      res.status(500).json({message:"Error"})
    }else{
      res.json(rows);
    }
  });
});


// GET a specific todo item by ID
app.get('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  db.get("SELECT * FROM todos WHERE id=?",[id],(err,row)=>{
    if (err){
      res.status(500).json({message:"Error"});
    }else{
      res.json(row)
    }
  });
});

// POST a new todo item
app.post('/todos', (req, res) => {
  const { name, priority = 'low', isFun = true } = req.body;

  if (!name) {
    return res.status(400).json({ message: 'Name is required' });
  }

  const insertQuery = `INSERT INTO todos (name, priority, isComplete, isFun) VALUES (?, ?, ?, ?)`;

  db.run(insertQuery, [name, priority, false, isFun], function(err) {
    if (err) {
      return res.status(400).json({ message: 'Error' });
    }

   
    const newTodo = {
      id: this.lastID, 
      name,
      priority,
      isComplete: false,
      isFun
    };

    
    res.status(201).json(newTodo);
  }); 

}); 

// DELETE a todo item by ID
app.delete('/todos/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const deleteQuery=`DELETE FROM todos WHERE id = ?`;

  db.run(deleteQuery,[id],function(err){
    if (err){
      return res.status(400).json({message:"Error"});
    }
  })

    res.json({ message: `Todo item ${id} deleted.` });
  } );

// Start the server
app.listen(port, () => {
  console.log(`Todo API server running at http://localhost:${port}`);
});