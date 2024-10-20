import express from 'express';
import mysql from 'mysql2';
import morgan from 'morgan';
import colors from 'colors';
//const express = require('express');
//const mysql = require("mysql2");

const app = express();

app.use(express.json());
app.use(morgan('dev'));

// connecting Database
const db = mysql.createPool({  
  host: "localhost",
  user: "root",
  password: "",
  database: "basic_crud",
});

// conditionaly listen, listing will working only when db is connected.
// db.query('SELECT 1').then(() => {   
//   // MySql
//   console.log('Mysql Database connected'.bgCyan.white);
// }).catch( (error) => {
//   console.log(error);
// });


// API Requests

// Test API - checking is api route is working or not 
app.get("/test", async (req,res) => {
  console.log("this is test route");
  res.status(200).json({
    succuss:true,
    message:"Test api is working fine"
  })
});

// Create Users - GET API
app.post("/users", async (req, res) => {
  try {

    const { name, address, country } = req.body;
    const [{ insertId }] = await db.promise().query(
      `INSERT INTO users (name, address, country) 
          VALUES (?, ?,?)`,
      [name, address, country]
    );

    res.status(202).json({
      succuss:true,
      message: "User Created",
      data: insertId
    });

  } catch (error) {
    res.status(500).json({
      succuss:false,
      message:'Error in create users API',
      error
    });
  }
});

// Get all Users details, GET API
app.get("/users", async (req, res) => {
  try {
    const data = await db.promise().query(`SELECT *  from users`);
    if(!data){
      return res.status(500).send({
        succuss:false,
        message:'Records not found',
      });
    }

    res.status(200).json({
      succuss:true,
      userTotal: data[0].length,
      data: data[0],
    });
  } catch (error) {
    res.status(500).json({
      succuss:false,
      message: 'Error in get users API...',
      error
    });
  }
});

// Get User Single User by ID, GET API
app.get("/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    if(isNaN(userId)){
      return res.status(500).json({
        succuss:false,
        message:"Invalid User ID passed in param",
        userId: userId
      })
    }

    const data = await db.promise().query(`SELECT *  from users where id = ?`, [userId]);

    if(data[0].length == 0){
      return res.status(404).json({
        succuss:false,
        message:'User Details not found',
      });
    }

    res.status(200).json({
      succuss:true,
      message:'User Details Found',
      user: data[0][0],
    });

  } catch (error) {
    res.status(500).json({
      succuss:false,
      message: 'Error Get User Details by ID, API',
      error
    });
  }
});

// Update User by id, PUT API
app.put("/user/:id", async (req, res) => {
  try {
    const userID = req.params.id;

    if(isNaN(userID)) {
      return res.status(500).json({
        succuss:false,
        message:'Params User ID is invalid',
      });
    }

    const {name, address, country} = req.body;
    const sql = 'UPDATE users SET name=?, address=?, country=? WHERE id =?';
    const data = db.promise().query(sql,[name, address, country, userID]);

    res.status(200).json({
      succuss:true,
      message:'User Updated Successfully',
    });
    
  } catch (error) {
    res.status(500).json({
      succuss:false,
      message:"Error, User PUT API",
      error
    })
  }
});

// Update User by ID,  PATCH API for specific fields.
app.patch("/user/:id", async (req, res) => {
  try {
    const { userID } = req.params;
    if(isNaN(userID)) {
      return res.status(500).json({
        succuss:false,
        message:'Params User ID is invalid',
      });
    }

    const updateParams = req.body;
    const sql = 'UPDATE users SET ? WHERE id = ?';
    const update = await db.promise().query(sql,[updateParams,userID]);

    res.status(200).json({
      succuss:true,
      message: "user updated successfully, vai patch",
      update
    });

  } catch (error) {
    res.status(500).json({
      succuss:false,
      message: 'Error User update - patch API',
      error
    });
  }
});

// Delete user by ID, DEL API
app.delete("/user/:id", async (req, res) => {
    try {
      const userID = req.params.id;
      if(isNaN(userID)) {
        return res.status(500).json({
          succuss:false,
          message:'Params User ID is invalid for delete',
        });
      }

      const deleteUser = await db.promise().query(`DELETE FROM  users where id = ?`, [userID]);

      res.status(200).json({
        succuss:true,
        message: "User has been deleted successfully",
        deleteUser
      });

    } catch (error) {
      res.status(500).json({
        succuss:false,
        message: 'Error while delete User API' ,
        error
      });
    }
});

app.listen(3000, ()=> {
  console.log(`Server Running on port 3000`.bgGreen.white);
});