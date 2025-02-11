const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Connect to the menu database
const menuDb = new sqlite3.Database('./menu.db', (err) => {
  if (err) {
    console.error('Error connecting to menu database:', err);
  } else {
    console.log('Connected to menu database');
  }
});

// Create ratings table if it doesn't exist
menuDb.run(`
  CREATE TABLE IF NOT EXISTS ratings (
    meal TEXT PRIMARY KEY,
    average_rating REAL,
    rating_count INTEGER
  );
`, (err) => {
  if (err) {
    console.error("Error creating ratings table:", err);
    return;
  }

  // Now check if the table is empty
  menuDb.get(`SELECT COUNT(*) AS count FROM ratings`, (err, row) => {
    if (err) {
      console.error("Error checking ratings table:", err);
      return;
    }

    if (row.count === 0) {
      menuDb.run(`
        INSERT INTO ratings (meal, average_rating, rating_count) VALUES
        ('breakfast', 0, 0),
        ('lunch', 0, 0),
        ('snacks', 0, 0),
        ('dinner', 0, 0);
      `);
    }
  });
});

menuDb.run(`CREATE TABLE IF NOT EXISTS comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  meal TEXT NOT NULL,
  comment TEXT NOT NULL,
  date TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
)`);


const resetRatings = () => {
  const now = new Date();
  const currentHours = now.getHours();
  const currentMinutes = now.getMinutes();

  // Ensure this runs only between 00:00 - 00:09 (first 10 minutes of the day)
  if (currentHours === 0 && currentMinutes < 10) {
    menuDb.serialize(() => {
      // Delete all existing ratings
      menuDb.run(`DELETE FROM ratings`, (err) => {
        if (err) {
          console.error('Error deleting ratings:', err);
          return;
        }
        console.log('Ratings table cleared.');

        // Reinsert the 4 default meals with zero values
        menuDb.run(
          `INSERT INTO ratings (meal, average_rating, rating_count) VALUES 
           ('breakfast', 0, 0), 
           ('lunch', 0, 0), 
           ('snacks', 0, 0), 
           ('dinner', 0, 0)`,
          (err) => {
            if (err) {
              console.error('Error inserting default ratings:', err);
            } else {
              console.log('Ratings reset successfully.');
            }
          }
        );
      });
    });
  }
};

// Run every 10 minutes to check if it's midnight
resetRatings();
setInterval(resetRatings, 10 * 60 * 1000);

// API endpoint for fetching menu for a specific day and week
app.get('/api/menu/:day/:week', (req, res) => {
  const { day, week } = req.params;
  const query = `
    SELECT meal, GROUP_CONCAT(item, ', ') as items
    FROM menu 
    WHERE day = ? AND week = ?
    GROUP BY meal
    ORDER BY 
      CASE meal
        WHEN 'breakfast' THEN 1
        WHEN 'lunch' THEN 2
        WHEN 'snacks' THEN 3
        WHEN 'dinner' THEN 4
      END
  `;

  menuDb.all(query, [day, week], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});



// API endpoint to get ratings
app.get('/api/ratings', (req, res) => {
  const query = `
    SELECT meal, average_rating, rating_count
    FROM ratings
    ORDER BY 
      CASE meal
        WHEN 'breakfast' THEN 1
        WHEN 'lunch' THEN 2
        WHEN 'snacks' THEN 3
        WHEN 'dinner' THEN 4
        ELSE 5  -- For any other meals, they will be ordered after these four
      END
  `;
  menuDb.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/ratings/update', (req, res) => {
  const { meal, newRating } = req.body;

  // Ensure we are dealing with valid data
  if (typeof newRating !== 'number' || newRating < 1 || newRating > 5) {
    return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
  }

  // Get the current rating count and average rating for the meal
  const getQuery = 'SELECT average_rating, rating_count FROM ratings WHERE meal = ?';
  menuDb.get(getQuery, [meal], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }

    if (!row) {
      // If no ratings exist for this meal, initialize them
      const insertQuery = 'INSERT INTO ratings (meal, average_rating, rating_count) VALUES (?, ?, ?)';
      menuDb.run(insertQuery, [meal, newRating, 1], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Rating added successfully' });
      });
    } else {
      // Calculate the new average rating and rating count
      const { average_rating, rating_count } = row;
      const totalRating = average_rating * rating_count + newRating; // Total rating score
      const newRatingCount = rating_count + 1; // Increment rating count
      const newAverageRating = totalRating / newRatingCount; // Recalculate average rating

      // Update the ratings table with the new values
      const updateQuery = `
        UPDATE ratings 
        SET average_rating = ?, rating_count = ? 
        WHERE meal = ?
      `;
      menuDb.run(updateQuery, [newAverageRating, newRatingCount, meal], (err) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json({ message: 'Rating updated successfully' });
      });
    }
  });
});

app.get('/api/comments', (req, res) => {
  menuDb.all('SELECT * FROM comments ORDER BY date DESC', [], (err, rows) => {
    if (err) {
      console.error('Error fetching comments:', err);
      return res.status(500).json({ error: 'Failed to fetch comments' });
    }
    res.json(rows);
  });
});

app.post('/api/comments/add', (req, res) => {
  const { meal, comment } = req.body;

  const query = `INSERT INTO comments (meal, comment) VALUES (?, ?)`;
  
  menuDb.run(query, [meal, comment], function (err) {
    if (err) {
      console.error('Error inserting comment:', err);
      return res.status(500).json({ success: false, message: 'Failed to submit comment.' });
    }
    res.status(200).json({ success: true, message: 'Comment submitted successfully!' });
  });
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
