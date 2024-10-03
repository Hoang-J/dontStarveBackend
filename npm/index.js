/* 
-------------------------------------------------------------------------------------------------------------------
Initializer codes to use the different npms installed
-------------------------------------------------------------------------------------------------------------------
*/


// code to use express
const express = require('express');
const app = express();


// code to use body parser to see json in res
const bodyParser = require('body-parser');
app.use(bodyParser.json());

// code to use pg-promise
const pgp = require('pg-promise')();
// using elephantSQL to make it easier between team members (if future collaboration needed) to access the database
const db = pgp("postgres://xdaqoucm:MPXPSXid3FIx0a-RPKDLCdi4ilNRrwPE@castor.db.elephantsql.com/xdaqoucm");

// code to use winston (error logging)
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    // - Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    // - Write all logs with importance level of `info` or less to `combined.log`
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// function for when a client makes a error, will collect specific data regarding that error
function clientError (req, message, errorCode) {
  logger.log({
    level: 'info',
    endpoint: req.path,
    method: req.method,
    query: req.query,
    pathParameters: req.params,
    body: req.body,
    ip: req.ip,
    error: errorCode,
    message: message,
    timestamp: new Date().toUTCString(),
  });
}

// Middleware to create a log for every API call 
let clientID = 0;

app.all('/*', (req, res, next) => {
  clientID++;
  logger.log({
    level: 'info',
    endpoint: req.path,
    method: req.method,
    query: req.query,
    pathParameters: req.params,
    body: req.body,
    ip: req.ip,
    timestamp: new Date().toUTCString(),
  });
  next()
    
})

/* 
-------------------------------------------------------------------------------------------------------------------
                                                 ROOT ENDPOINT
-------------------------------------------------------------------------------------------------------------------
*/

app.get('/', async (req, res) => {
  res.send("server deployed successfully");
})

/* 
-------------------------------------------------------------------------------------------------------------------
                                                 GET ENDPOINTS
-------------------------------------------------------------------------------------------------------------------
*/

/*
Endpoint: 
    GET: returns a list of survivors and their stats
Query Parameters:
    name[string]: name of the survivor(character)
*/

app.get('/survivors', async (req, res) => {
    let survivorData = await db.manyOrNone('SELECT * FROM survivors');
    // Makes sure that there are no body parameters at this GET endpoint
    if(Object.keys(req.body).length != 0) {
        clientError(req, "Request body is not permitted at this endpoint", 400);
        res.status(400).json({error: "Request body is not permitted at this endpoint"});
    } 
    // Makes sure that user only use one query param
    else if(Object.keys(req.query).length > 1) {
        clientError(req, "Query parameters do not meet the requirements", 400);
        res.status(400).json({error: "Query parameters do not meet the requirements length"});
    } 
    else{
        // return the entire list of survivors if a name query is not provided
        if(req.query.name == undefined) {
          res.json(survivorData);
        }
        // when a user provides a survivor name will go through the code in the conditional below
        else if(req.query.name != undefined){
        // declaring a global variable for later access
        let nameFound;
        // Checking if the name exists in the database
        for(let i = 0; i < survivorData.length; i++) {
            if(survivorData[i].name == req.query.name) {
            nameFound = true;
            break;
            }
            else {
            nameFound = false;
            }
        }
        // if name is found, will retrieve the survivor character and display their stats
        if(nameFound === true) {
          let singleSurvivor = await db.oneOrNone('SELECT * FROM survivors WHERE name = $1', req.query.name)
          res.json(singleSurvivor)

          
        }
        else if(nameFound === false) {
            res.json("There are no survivor under that name. Try a different name.")
        }
    } 
  }
});

/*
Endpoint: 
    GET: returns a list of recipes and their stats
Query Parameters:
    name[string]: name of the recipe
*/

app.get('/recipes', async (req, res) => {
  let recipesData = await db.manyOrNone('SELECT * FROM recipes');
  // Makes sure that there are no body parameters at this GET endpoint
  if(Object.keys(req.body).length != 0) {
      clientError(req, "Request body is not permitted at this endpoint", 400);
      res.status(400).json({error: "Request body is not permitted at this endpoint"});
  } 
  // Makes sure that user only use one query param 
  else if(Object.keys(req.query).length > 1) {
      clientError(req, "Query parameters do not meet the requirements", 400);
      res.status(400).json({error: "Query parameters do not meet the requirements length"});
  } 
  else{
      // return the entire list of recipes if a recipe name query is not provided
      if(req.query.name == undefined) {
        res.json(recipesData);
      }
      // when a user provides a name  will go through the code in the conditional below
      else if(req.query.name != undefined){
      // declaring a global variable for later access
      let nameFound;
      // Checking if the recipe name exists in the database
      for(let i = 0; i < recipesData.length; i++) {
          if(recipesData[i].name == req.query.name) {
          nameFound = true;
          break;
          }
          else {
          nameFound = false;
          }
      }
      // once the recipe name is found, will retrieve and display the recipe stats
      if(nameFound === true) {
        let singleRecipe = await db.oneOrNone('SELECT * FROM recipes WHERE name = $1', req.query.name)
        res.json(singleRecipe)

        
      }
      else if(nameFound === false) {
          res.json("There are no recipe under that name. Try a different name.")
      }
  } 
}
});

/* 
-------------------------------------------------------------------------------------------------------------------
                                                 POST ENDPOINTS
-------------------------------------------------------------------------------------------------------------------
*/
/*
Endpoint: 
    POST: creates a new survivor 
Body:
    name[string](required): name of survivor character to be added into the database
    portrait[string](required): portrait image of survivor character to be added into the database
    health[integer](required): health stat of survivor character to be added into the database
    hunger[integer](required): hunger stat of survivor character to be added into the database
    sanity[integer](required): sanity stat of survivor character to be added into the database
    survivalOdds[string](required): survival odds of survivor character to be added into the database
    favoriteFood[string](required): favorite food of survivor character to be added into the database
*/

app.post('/addSurvivor', async function(req, res) {
    // retrieving the list of survivors and storing it in a global variable for later access
    let formData = await db.manyOrNone('SELECT * FROM survivors');
    // this endpoint should not have any query params since it is POST
    if(Object.keys(req.query).length > 0) {
      clientError(req, "Query not permitted at this endpoint", 400);
      res.status(400).json({error: "Query not permitted at this endpoint"});
    }
    else{
      if(req.body != undefined){
        let charExist;
        // looping through the survivors list stored inside the formData variable 
        // checking if there is already a survivor character that exists with the name provided
        for(let i = 0; i < formData.length; i++) {
          if(formData[i].name == req.body.name) {
            charExist = true;
            break;
          }
          else {
            charExist = false;
          }
        }
        if(charExist === true) {
          res.json("Survivor character exists. Please try a different character.")
        }
        else if(charExist === false) {
          db.none('INSERT INTO survivors (name, portrait, health, hunger, sanity, survivalOdds, favoriteFood) VALUES($1, $2, $3, $4, $5, $6, $7)', [req.body.name, req.body.portrait, req.body.health, req.body.hunger, req.body.sanity, req.body.survivalodds, req.body.favoritefood]);
          res.json(`${req.body.name} survivor character added into the database.`);
        }
      } 
    }
  });


/*
Endpoint: 
    POST: creates a new recipe
Body:
    name[string](required): name of recipe to be added into the database
    image[string](required): image of recipe to be added into the database
    type[string](required): type of recipe to be added into the database
    health[integer](required): health stat of recipe to be added into the database
    hunger[integer](required): hunger stat of recipe to be added into the database
    sanity[integer](required): sanity stat of recipe to be added into the database
    daysPerish[integer](required): days it takes for recipe to perish(rot)
    cookTimeSec[integer](required): seconds it takes for recipe to cook in crockpot
*/

app.post('/addRecipe', async function(req, res) {
  // retrieving the list of recipes and storing it in a global variable for later access
  let formData = await db.manyOrNone('SELECT * FROM recipes');
  // this endpoint should not have any query params since it is POST
  if(Object.keys(req.query).length > 0) {
    clientError(req, "Query not permitted at this endpoint", 400);
    res.status(400).json({error: "Query not permitted at this endpoint"});
  }
  else{
    if(req.body != undefined){
      let recipeExist;
      // looping through the recipe list stored inside the formData variable 
      // checking if there is already a recipe that exists with the name provided
      for(let i = 0; i < formData.length; i++) {
        if(formData[i].name == req.body.name) {
          recipeExist = true;
          break;
        }
        else {
          recipeExist = false;
        }
      }
      if(recipeExist === true) {
        res.json("Recipe exists. Please try a different recipe.")
      }
      else if(recipeExist === false) {
        db.none('INSERT INTO recipes (name, image, type, health, hunger, sanity, daysPerish, cookTimeSec) VALUES($1, $2, $3, $4, $5, $6, $7, $8)', [req.body.name, req.body.image, req.body.type, req.body.health, req.body.hunger, req.body.sanity, req.body.daysperish, req.body.cooktimesec]);
        res.json(`${req.body.name} recipe added into the database.`);
      }
    } 
  }
});


/* 
-------------------------------------------------------------------------------------------------------------------
                                                 DELETE ENDPOINTS
-------------------------------------------------------------------------------------------------------------------
*/

/*
Endpoint: 
    DELETE: deletes a survivor character by name
    username[string]: name of the survivor character
*/
app.delete('/survivor/:name', async (req, res) => {
  if(Object.keys(req.body).length != 0) {
      clientError(req, "Request body is not permitted", 400);
      // check if a body was provided in the request
      res.status(400).json({
          error: "Request body is not permitted"
      });
  } else {
      const nameInput = (req.params.name);
      let charDelete = await db.query('DELETE FROM survivors WHERE name = $1 RETURNING *', [nameInput]);
      res.json(charDelete);
  }
})


/*
Endpoint: 
    DELETE: deletes a recipe by name
    username[string]: name of the recipe
*/
app.delete('/recipe/:name', async (req, res) => {
  if(Object.keys(req.body).length != 0) {
      clientError(req, "Request body is not permitted", 400);
      // check if a body was provided in the request
      res.status(400).json({
          error: "Request body is not permitted"
      });
  } else {
      const nameInput = (req.params.name);
      let recipeDelete = await db.query('DELETE FROM recipes WHERE name = $1 RETURNING *', [nameInput]);
      res.json(recipeDelete);
  }
})

/* 
-------------------------------------------------------------------------------------------------------------------
                                                 APP.LISTEN
-------------------------------------------------------------------------------------------------------------------
*/

// To run server on port 5000
app.listen(5000, () => {
  console.log("Server is running on port 5000");
})

module.exports = app;