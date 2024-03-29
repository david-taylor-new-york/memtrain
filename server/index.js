const express = require("express")
const bodyParser = require('body-parser')
const app = express()
const cors = require("cors")

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.json())
app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Access-Control-Allow-Headers')
  next()
})

const Pool = require('pg').Pool

const pool = new Pool({
  user: 'davidtaylor',
  host: 'localhost',
  database: 'memtrain',
  password: 'davidtaylor2',
  port: 5432,
})

app.listen(3001, () => {
  console.log('Server is running on port 3001')
})


app.post('/insert', async (req, res) => {
  const { tableName, data } = req.body

  try {
    const insertedData = await insertData(tableName, data)
    res.send(insertedData)
  } catch (error) {
    handleServerError(res, error)
  }

})

app.get('/get', async (req, res) => {
  const { table_name, param_name } = req.query
  const paramValue = req.query[param_name]

  if (!table_name || !param_name) {
    res.status(400).send('Missing required parameters')
    return
  }

  const queryText = `SELECT * FROM ${table_name} WHERE ${param_name} = $1`

  try {
    const { rows } = await pool.query(queryText, [paramValue])
    console.log(" ")
    console.log("queryText = {" + queryText + "} paramValue = " + paramValue)
    console.log(" ")
    console.log("returning:")
    console.log(rows)
    console.log(" ")
    res.send(rows)
  } catch (error) {
    handleServerError(res, error)
  }

})

app.get('/get_today_or_earlier', async (req, res) => {
  const { table_name, param_name } = req.query
  const paramValue = req.query[param_name]

  const today = new Date()

  if (!table_name || !param_name) {
    res.status(400).send('Missing required parameters')
    return
  }

  const queryText = `SELECT * FROM ${table_name} WHERE ${param_name} = $1 AND next_review_date <= $2`

  try {
    const { rows } = await pool.query(queryText, [paramValue, today])
    console.log(' ')
    console.log(`queryText = ${queryText} paramValue = ${paramValue}`)
    console.log(' ')
    console.log('returning:')
    console.log(rows)
    console.log(' ')
    res.send(rows)
  } catch (error) {
    handleServerError(res, error)
  }
})

app.put('/update', async (req, res) => {
  const { tableName, data } = req.body

  if (!tableName || !data) {
    res.status(400).send('Missing required parameters')
    return
  }

  const updateFields = Object.keys(data)
    .filter(key => key !== 'id') // Exclude 'id' from update fields
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ')

  const queryText = `UPDATE ${tableName} SET ${updateFields} WHERE id = $1`

  try {
    const updateValues = Object.values(data).filter((_, index) => index !== 0) // Exclude 'id'
    console.log("updateValues=")
    console.log(updateValues)
    console.log("queryText=")
    console.log(queryText)
    console.log("data.id=")
    console.log(data.id)
    const { rowCount } = await pool.query(queryText, [data.id, ...updateValues])

    if (rowCount > 0) {
      res.send("success")
    } else {
      res.status(404).send(`Could not update table: ${tableName}`)
    }
  } catch (error) {
    handleServerError(res, error)
  }

})

app.put('/update_card_schedules', async (req, res) => {
  const { tableName, data } = req.body

  console.log("data=")
  console.log(data)

  if (!tableName || !data) {
    res.status(400).send('Missing required parameters')
    return
  }

  const updateFields = Object.keys(data)
    .filter(key => key !== 'card_id') // Exclude 'card_id' from update fields
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ')

  const queryText = `UPDATE ${tableName} SET ${updateFields} WHERE card_id = $1`

  try {
    const updateValues = Object.values(data).filter((_, index) => index !== 0) // Exclude 'id'
    console.log("update_card_schedules updateValues=")
    console.log(updateValues)
    console.log("update_card_schedules queryText=")
    console.log(queryText)
    console.log("update_card_schedules data.card_id=")
    console.log(data.card_id)
    const { rowCount } = await pool.query(queryText, [data.card_id, ...updateValues])

    if (rowCount > 0) {
      res.send("success")
    } else {
      res.status(404).send(`Could not update table: ${tableName}`)
    }
  } catch (error) {
    handleServerError(res, error)
  }

})

app.delete('/delete', async (req, res) => {
  const { tableName, id } = req.body

  if (!tableName || !id) {
    res.status(400).send('Missing required parameters')
    return
  }

  const queryText = `DELETE FROM ${tableName} WHERE id = $1`

  try {
    const { rowCount } = await pool.query(queryText, [id])

    if (rowCount > 0) {
      res.send("success")
    } else {
      res.status(404).send(`No ${tableName} deleted!`)
    }
  } catch (error) {
    handleServerError(res, error)
  }

})


async function insertData(tableName, data) {
  const isArray = Array.isArray(data)
  const dataArray = isArray ? data : [data] // Convert single data to an array if needed

  try {
    const results = await Promise.all(
      dataArray.map(async (itemData) => {
        const keys = Object.keys(itemData).join(', ')
        const values = Object.values(itemData)
        const placeholders = values.map((_, index) => `$${index + 1}`).join(', ')

        const queryText = `INSERT INTO ${tableName} (${keys}) VALUES (${placeholders}) RETURNING id`
        console.log("insertData : queryText=")
        console.log(queryText)

        try {
          const { rowCount, rows } = await pool.query(queryText, values)

          if (rowCount > 0) {
            console.log(`INSERT INTO ${tableName} (${keys})`)
            console.log("insertData: RETURNING rows[0]:")
            console.log(rows[0])
            return rows[0]
          } else {
            throw new Error(`Failed to insert data into ${tableName}`)
          }
        } catch (error) {
          throw error
        }
      })
    )
    return isArray ? results : results[0] // Return array or single result as appropriate
  } catch (error) {
    throw error
  }
}

const handleServerError = (res, error) => {
  console.error("there was an error:")
  console.error(error)
  res.status(500).send("Internal Server Error")
}

// const pool = new Pool({
//   user: 'postgres',
//   host: 'memtrain-db-instance.cghnn3ptithy.us-east-1.rds.amazonaws.com',
//   database: 'memtrain',
//   password: 'Fuckyou1$',
//   port: 5432,
// })
// psql \
//    --host=<DB instance endpoint> \
//    --port=<port> \
//    --username=<master username> \
//    --password \
//    --dbname=<database name> 
// psql \
//    --host='memtrain-db-instance.cghnn3ptithy.us-east-1.rds.amazonaws.com' \
//    --port='5432' \
//    --username=postgres \
//    --password \
//    --dbname=memtrain
