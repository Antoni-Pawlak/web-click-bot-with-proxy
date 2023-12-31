/*FlightsAPI*/

//setup .env
require('dotenv').config()

//extra security package
const helmet = require('helmet')
const cors = require("cors")
const xss = require('xss-clean')

//Swagger Implementation
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('./swagger.yaml')

//importing mongoose module
const connectDB = require('./database/connect')


const express = require('express')
const app = express()
app.use(cors())
app.use(helmet())
app.use(xss())


//importing router
const keywords = require('./routes/keywords')


//setup middleware
app.use(express.json())


//implementing router
app.use('/api/v1/keywords', keywords)


app.get('/', (req, res) => {
    res.send('<h1 style = " background-color:#F5F5F7; color:#7AA874; text-align:center; font-family: Helvetica, Arial; font-weight: 600px; font-size:48px; color:black; margin-top: 250px;">Flights API</br><p style="color:grey; font-size:35px"> <a href="/api-docs">Documentation</a></p></h1>')
})
app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocument));

const port = process.env.PORT || 8080

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)
        app.listen(port, console.log(`Server is listening on port ${port}...`))
    } catch (error) {
        console.log(error)
    }
}

start()
/*FlightsAPI*/