import pool from '../data/db.js'
import { Router } from 'express'

const router = Router()


router.get('/kategoriak', async(req,res)=>{
      let sql = `
        SELECT c.kategoria, COUNT(DISTINCT c.id) AS receptDb, ROUND(AVG(c.ido)) AS atlagIdo, ROUND(AVG(k.koltseg)) AS atlagKoltseg
        FROM receptek c
        LEFT JOIN (
            SELECT rh.recept_id, SUM(rh.mennyiseg * h.egysegar) AS koltseg
            FROM recept_hozzavalok rh
            JOIN hozzavalok h ON h.id = rh.hozzavalo_id
            GROUP BY rh.recept_id
        ) k ON k.recept_id = c.id
        GROUP BY c.kategoria
        ORDER BY FIELD( c.kategoria,'reggeli','leves','főétel','desszert')`
    
    const [eredmeny] = await pool.query(sql)

    const statisztika = eredmeny.map(k => ({
        kategoria: k.kategoria,
        receptDb: Number(k.receptDb),
        atlagIdo: Number(k.atlagIdo),
        atlagKoltseg: Number(k.atlagKoltseg)
    }))

    res.status(200).json(statisztika)
})

export default router