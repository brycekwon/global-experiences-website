import { Router } from "express";


const experienceRouter = Router();

export default (pool) => {
    experienceRouter.get('/', async(req, res) => {
        try {
            const result = await pool.query('SELECT * FROM experience');
            res.json(result.rows);
        } catch (err) {
            res.status(500).send("Server Error");
        }
    })

    experienceRouter.get('/search', async(req, res) => {
        const searchQuery = req.query.q || '';

        if (!searchQuery) {
            return res.json([]); // Return an empty array if no query
        }

        try {
            // Perform a fuzzy search using ILIKE (case-insensitive LIKE)
            //const query = `
            //    SELECT * FROM experience
            //    WHERE (name ILIKE $1
            //        OR affiliation ILIKE $1
            //        OR program ILIKE $1
            //        OR city ILIKE $1
            //        OR country ILIKE $1
            //        OR institutions ILIKE $1
            //        OR partnerships ILIKE $1)
            //    AND isApproved = TRUE
            //    AND isVisible = TRUE
            //`;
            const query = `
                SELECT
                    id,
                    name,
                    affiliation,
                    program,
                    country,
                    city,
                    ongoing,
                    startDate,
                    endDate,
                    institutions,
                    partnerships,
                    description,
                    CASE
                        WHEN contactVisible THEN email
                        ELSE NULL
                    END AS email
                FROM experience
                WHERE (
                    name ILIKE $1
                    OR affiliation ILIKE $1
                    OR program ILIKE $1
                    OR city ILIKE $1
                    OR country ILIKE $1
                    OR institutions ILIKE $1
                    OR partnerships ILIKE $1
                )
                AND isApproved = TRUE
                AND isVisible = TRUE
            `;


            const values = [`%${searchQuery}%`]; // Use % for fuzzy matching

            const result = await pool.query(query, values);
            res.json(result.rows); // Return the matching rows as JSON
        } catch (err) {
            console.error(err);
            res.status(500).json({ error: 'An error occurred while searching' });
        }
    });
    experienceRouter.post('/add', (req, res) => { console.log("Add Route") });

    return experienceRouter;
}
