import express from 'express'
import receptek from './routes/receptek.js'

const app = express();
const port = 3000;


app.use('/receptek', receptek)


app.listen(port,()=>{
    console.log(`Server is running: http://localhost:${port}`);
})