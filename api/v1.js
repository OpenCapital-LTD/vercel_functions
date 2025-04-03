// import type { VercelRequest, VercelResponse } from '@vercel/node';
import mysql from 'mysql2/promise';
import {
  v4
} from 'uuid'
import 'dotenv/config';

function corsMiddleware(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return true;
  }

  return false;
}
const dbUrl = "mysql://tech_support:wArkB_3nch@be.opencapital.com:3306/oca_fun"
const dbT = process.env.DATABASE_URL

export default async function handler(req, res) {
  const exited = corsMiddleware(req, res);
  if (exited) return;
  const {
    r
  } = req.query
  console.log('###################',r)

  switch (r) {
    case 'g_pz':
      try {
        const connection = await mysql.createConnection(dbUrl);
        const [rows] = await connection.execute(`
          SELECT 
          p.id,
          p.name,
          p.description,
          p.difficulty,
          COUNT(DISTINCT w.id) AS wordCount,
          COUNT(DISTINCT r.id) AS completions
          FROM Puzzles p
          LEFT JOIN Words w ON w.puzzle = p.name
          LEFT JOIN Results r ON r.puzzle = p.name
          GROUP BY p.id, p.name, p.description, p.difficulty;
          `);
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'g_wds':
      try {
        const connection = await mysql.createConnection(dbUrl);
        const [rows] = await connection.execute(`
          SELECT w.id, w.word, w.hint, p.name AS category FROM Words w LEFT JOIN Puzzles p ON w.puzzle = p.name`);
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'g_cwds':
      try {
        const connection = await mysql.createConnection(dbUrl);
        const [rows] = await connection.execute(`SELECT 
          p.name,
          w.id,
          w.word,
          w.hint
          FROM Puzzles p LEFT JOIN Words w ON p.name = w.puzzle WHERE p.status = 'current';
          `);
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'g_rs':
      try {
        const connection = await mysql.createConnection(dbUrl);
        const [rows] = await connection.execute('SELECT * FROM Results');
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'g_rsu':
      const {
        p, u
      } = req.query

      try {
        const connection = await mysql.createConnection(dbUrl);
        const [rows] = await connection.execute('SELECT * FROM Results WHERE puzzle=? AND name=?', {
          p,
          u
        });
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'p_pz':
      try {
        const {
          name,
          difficulty,
          description,
          category,
        } = req.body
        if (!name || !difficulty || !description) return res.status(400).json({
          error: "missing parameters"
        })
        console.log("starting connection")
        const connection = await mysql.createConnection(dbUrl);
        console.log("starting querying")

        await connection.execute(`UPDATE Puzzles SET status = ? WHERE status = 'current'`,
          ['past'])
        const [rows] = await connection.execute(`INSERT INTO Puzzles (
          id,
          name,
          difficulty,
          description,
          status,
          category
          )
          VALUES (?,?,?,?,?,?)`, [v4(), name, difficulty, description, 'current', category]);
        console.log("clossing connection")

        await connection.end();
        console.log('puzzle created')
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'p_upzs':
      try {
        const {
          name
        } = req.body
        if (!name || !difficulty || !description) return res.status(400).json({
          error: "missing parameters"
        })
        const connection = await mysql.createConnection(dbUrl);
        await connection.execute(`UPDATE Puzzles SET status = ?`,
          ['past'])
        await connection.execute(`UPDATE Puzzles SET status = ? WHERE name = ?`,
          ['current', name])
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'p_wds':
      try {
        const {
          puzzle,
          word,
          hint
        } = req.body

        if (!word || !puzzle || !hint) return res.status(400).json({
          error: "missing parameters"
        })
        const connection = await mysql.createConnection(dbUrl);
        const [rows] = await connection.execute(`INSERT INTO Words (
          id,
          puzzle,
          word,
          hint
          )
          VALUES (?,?,?,?)`, [v4(), puzzle, word, hint]);
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    case 'p_rs':
      try {
        const {
          name,
          puzzle,
          hints_taken,
          resets,
          time,
          correct,
          total,
          score,
          date,
        } = req.body
        console.log(req.body)
        if (!name || !puzzle || !date) return res.status(400).json({
          error: "missing parameters"
        })
        const connection = await mysql.createConnection(dbUrl);
        const [rows] = await connection.execute(`INSERT INTO Results (
          id,
          name,
          puzzle,
          hints_taken,
          resets,
          time,
          score,
          correct,
          total,
          date
          )
          VALUES (?,?,?,?,?,?,?,?,?,?)`, [v4(), name, puzzle, hints_taken, resets, time, score, correct, total, date]);
        await connection.end();
        res.status(200).json(rows);

      } catch (error) {
        console.error('DB Error:', error);
        res.status(500).json({
          error: 'DB connection failed'
        });
      }
      break
    default:
      res.status(404).json({
        error: "invalid request"
      })
  }
}