import pool from '../data/db.js'
import { Router } from 'express'

const router = Router();


router.get('/', async(req,res)=>{
    let sql = `
    SELECT h.id, h.nev, h.mertekegyseg, h.egysegar, COUNT(DISTINCT rh.recept_id) AS receptDb
    FROM hozzavalok h     
    LEFT JOIN recept_hozzavalok rh ON rh.hozzavalo_id = h.id
    GROUP BY h.id, h.nev, h.mertekegyseg, h.egysegar
    ORDER BY receptDb DESC, h.nev ASC
`
    const [eredmeny] = await pool.query(sql)

    res.status(200).json(eredmeny)
})

router.get('/nem-hasznalt', async(req,res)=>{
    let sql = `
    SELECT h.id, h.nev
    FROM hozzavalok h
    LEFT JOIN recept_hozzavalok rh ON rh.hozzavalo_id = h.id
    WHERE rh.hozzavalo_id IS NULL    
    ORDER BY h.nev ASC
`

    const [eredmeny] = await pool.query(sql)

    res.status(200).json(eredmeny)

})

export default router