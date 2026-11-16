import pool from '../data/db.js'
import { Router } from 'express'

const router = Router();


router.get('/', async(req,res)=>{
    let sql = `
    SELECT c.id, c.nev, c.kategoria, c.adag, c.ido, COUNT(h.id) AS hozzavaloDb, (SUM(rh.mennyiseg * h.egysegar)) AS koltseg
    FROM receptek c 
    LEFT JOIN recept_hozzavalok rh ON rh.recept_id = c.id
    LEFT JOIN hozzavalok h ON h.id = rh.hozzavalo_id
    GROUP BY c.id, c.nev, c.kategoria, c.adag, c.ido
    ORDER BY c.nev ASC
`

    const [eredmeny] = await pool.query(sql)
    

    res.status(200).json(eredmeny.map(recept=>({
        ...recept,
        hozzavaloDb: Number(recept.hozzavaloDb),
        koltseg: Number(recept.koltseg ?? 0)
    })))
})


export default router