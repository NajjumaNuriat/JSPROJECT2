// server.js

const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const bodyParser = require("body-parser");

// Create Express app
const app = express();
const port = 5000;

// Use body-parser to parse JSON data
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Create SQLite database and employee table if it doesn't exist
const db = new sqlite3.Database("./employee.DB", (err) => {
  if (err) {
    console.error("Error opening database:", err);
  } else {
    console.log("Connected to the SQLite database.");

    // Create employees table if it doesn't exist
    db.run(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                age INTEGER NOT NULL,
                created_at TEXT,
                updated_at TEXT
            )
        `);
  }
});
// Helper function to check for duplicate employee
function checkDuplicateEmployee(name, age, callback) {
  const lowercaseName = name.toLowerCase(); // Convert name to lowercase for case-insensitive comparison
  db.get(
    "SELECT * FROM employees WHERE LOWER(name) = ? AND age = ?",
    [lowercaseName, age],
    (err, row) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, row); // Return the row if a duplicate exists, or null if not
      }
    }
  );
}

//Helper function to check the employee ID limit
function checkEmployeeIdLimit(callback) {
  db.get("SELECT MAX(id) AS maxId FROM employees", (err, row) => {
    if (err) {
      callback(err, null);
    } else {
      callback(null, row.maxId);
    }
  });
}
// Endpoint to add a new employee
app.post("/api/employee", (req, res) => {
  const { name, age } = req.body;
  const created_at = new Date().toISOString();

  if (!name || !age) {
    return res.status(400).json({ error: "Name and age are required." });
  }
  // Check if employee with same name and age already exists
  checkDuplicateEmployee(name, age, (err, existingEmployee) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (existingEmployee) {
      return res.status(400).json({
        error: `Duplicate entry: Employee with name "${name}" and age ${age} already exists.`,
      });
    }
    // Check if the employee ID limit is reached (limit of 30 employees)
    checkEmployeeIdLimit((err, maxId) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (maxId >= 30) {
        return res.status(400).json({
          error:
            "Employee ID limit exceeded. Cannot add more than 30 employees.",
        });
      }
      // Insert new employee with the next available ID
      const nextId = maxId + 1; // Increment the current maxId by 1 for the new employee
      db.run(
        "INSERT INTO employees (id, name, age, created_at) VALUES (?, ?, ?, ?)",
        [nextId, name, age, created_at],
        function (err) {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          res.status(201).json({ id: nextId, name, age, created_at });
        }
      );
    });
  });
});

// Endpoint to get an employee by ID
app.get("/api/employee/:id", (req, res) => {
  const { id } = req.params;

  db.get("SELECT * FROM employees WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.json(row);
  });
});

// Endpoint to update an employee's details
app.put("/api/employee/:id", (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;
  const updated_at = new Date().toISOString();

  db.run(
    "UPDATE employees SET name = ?, age = ?, updated_at = ? WHERE id = ?",
    [name, age, updated_at, id],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: "Employee not found." });
      }
      res.json({ id, name, age, updated_at });
    }
  );
});

// Endpoint to delete an employee by ID
app.delete("/api/employee/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM employees WHERE id = ?", [id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Employee not found." });
    }
    res.json({ message: `Employee with ID ${id} deleted.` });
  });
});

// Endpoint to get all employees
app.get("/api/employees", (req, res) => {
  db.all("SELECT * FROM employees", (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// Endpoint to clear all employees
app.delete("/api/employees", (req, res) => {
  db.run("DELETE FROM employees", function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ message: "All employees have been removed." });
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
