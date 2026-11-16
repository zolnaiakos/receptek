import pool from '../data/db.js'
import { Router } from 'express'

const router = Router();


router.get('/', async(req,res)=>{

    const {kategoria, maxIdo} = req.query
    const kategoriak = ['főétel', 'leves', 'desszert', 'reggeli']

    let params = []

    let sql = `
    SELECT c.id, c.nev, c.kategoria, c.adag, c.ido, COUNT(h.id) AS hozzavaloDb, (SUM(rh.mennyiseg * h.egysegar)) AS koltseg
    FROM receptek c 
    LEFT JOIN recept_hozzavalok rh ON rh.recept_id = c.id
    LEFT JOIN hozzavalok h ON h.id = rh.hozzavalo_id
`


    if(kategoria){
        sql += ' WHERE c.kategoria = ?'
        params.push(kategoria)
    }

    if(maxIdo){
        sql += ' AND c.ido <= ?'
        params.push(maxIdo)
    }

    sql += ' GROUP BY c.id, c.nev, c.kategoria, c.adag, c.ido'
    sql += ' ORDER BY c.nev ASC'

     if (kategoria && !kategoriak.includes(kategoria)) {
    return res.status(400).json({
        error: "Hibás kategória"
        })
    }


    if (!Number.isInteger(Number(maxIdo)) || Number(maxIdo) <= 0) {
    return res.status(400).json({
        error: "Hibás maxIdő érték"
        })
    }

    const [eredmeny] = await pool.query(sql,params)

    res.status(200).json(eredmeny.map(recept=>({
        ...recept,
        hozzavaloDb: Number(recept.hozzavaloDb),
        koltseg: Number(recept.koltseg ?? 0)
    })))
})

router.get('/:id', async(req,res)=>{
    const { id } = req.params

    const { adag } = req.query

    let sql = `
    SELECT c.id, c.nev, c.kategoria, c.adag, c.ido, h.id AS hozzavaloId, h.nev AS hozzavaloNev, rh.mennyiseg, h.mertekegyseg, (rh.mennyiseg * h.egysegar) AS koltseg
    FROM receptek c    
    LEFT JOIN recept_hozzavalok rh ON rh.recept_id = c.id
    LEFT JOIN hozzavalok h ON h.id = rh.hozzavalo_id
    WHERE c.id = ?
    ORDER BY h.nev ASC
`
    
    const [eredmeny] = await pool.query(sql, [id])

    const receptek = {
        id: eredmeny[0].id,
        nev: eredmeny[0].nev,
        kategoria: eredmeny[0].kategoria,
        adag: eredmeny[0].adag,
        ido: eredmeny[0].ido,
        hozzavalok:[]
    }

    eredmeny.forEach(hozzavalok=>{
        receptek.hozzavalok.push({
            id: hozzavalok.hozzavaloId,
            nev: hozzavalok.hozzavaloNev,
            mennyiseg: Number(hozzavalok.mennyiseg),
            mertekegyseg: hozzavalok.mertekegyseg,
            koltseg: Number(hozzavalok.koltseg)
        })
    })

    receptek.koltseg = receptek.hozzavalok.reduce(
    (osszeg, h) => osszeg + h.koltseg, 0
    )

    receptek.adagonkent = Math.round(receptek.koltseg / receptek.adag)

    res.status(200).json(receptek)

})


export default router