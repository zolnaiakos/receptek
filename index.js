import express from 'express'
import receptek from './routes/receptek.js'
import hozzavalok from './routes/hozzavalok.js'
import statisztika from './routes/statisztika.js'

const app = express();
const port = 3000;

app.use(express.json());

app.use('/receptek', receptek)
app.use('/hozzavalok', hozzavalok)
app.use('/statisztika', statisztika)


app.listen(port,()=>{
    console.log(`Server is running: http://localhost:${port}`);
})