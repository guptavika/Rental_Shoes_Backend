// import express from "express";
// import cors from "cors";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import db from "./db.js";
// import dotenv from "dotenv";

// import shoesRoutes from "./routes/shoes.js";
// import cartRoutes from "./routes/cart.js";

// dotenv.config();

// const app = express();

// // ===== MIDDLEWARES =====
// app.use(cors());
// app.use(express.json()); // 🔥 MUST HAVE
// app.use("/uploads", express.static("uploads"));

// // ===== REGISTER =====
// app.post("/api/register", async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;

//     const hashedPassword = await bcrypt.hash(password, 10);

//     await db.query(
//       "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
//       [name, email, hashedPassword, role || "user"]
//     );

//     res.status(201).json({ message: "User registered successfully" });

//   } catch (err) {
//     console.error("REGISTER ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ===== LOGIN =====
// app.post("/api/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     const [rows] = await db.query(
//       "SELECT * FROM users WHERE email = ?",
//       [email]
//     );

//     if (rows.length === 0) {
//       return res.status(400).json({ error: "User not found" });
//     }

//     const user = rows[0];

//     const match = await bcrypt.compare(password, user.password);
//     if (!match) {
//       return res.status(400).json({ error: "Invalid password" });
//     }

//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.json({
//       token,
//       name: user.name,
//       role: user.role
//     });

//   } catch (err) {
//     console.error("LOGIN ERROR:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // ===== ROUTES =====
// app.use("/api/shoes", shoesRoutes);
// app.use("/api/cart", cartRoutes);

// // ===== GLOBAL ERROR HANDLER (IMPORTANT) =====
// app.use((err, req, res, next) => {
//   console.error("GLOBAL ERROR:", err);
//   res.status(500).json({ error: "Internal Server Error" });
// });

// // ===== START SERVER =====
// app.listen(process.env.PORT || 5000, () => {
//   console.log("Server running on http://localhost:5000");
// });



import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import db from "./db.js";

import shoesRoutes from "./routes/shoes.js";
import cartRoutes from "./routes/cart.js";

dotenv.config();

const app = express();

// ===== MIDDLEWARES =====
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// ===== HEALTH CHECK =====
app.get("/", (req, res) => {
  res.status(200).json({
    message: "Rental Shoes Backend is running",
    status: "success",
  });
});

// ===== REGISTER =====
app.post("/api/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    const [existingUsers] = await db.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({
        error: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.query(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role || "user"]
    );

    res.status(201).json({
      message: "User registered successfully",
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);

    res.status(500).json({
      error: "Registration failed",
    });
  }
});

// ===== LOGIN =====
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const [rows] = await db.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    const user = rows[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({
        error: "Invalid password",
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is missing");
      return res.status(500).json({
        error: "Server configuration error",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    res.status(200).json({
      token,
      name: user.name,
      role: user.role,
    });
  } catch (err) {
    console.error("LOGIN ERROR:", err);

    res.status(500).json({
      error: "Login failed",
    });
  }
});

// ===== ROUTES =====
app.use("/api/shoes", shoesRoutes);
app.use("/api/cart", cartRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
  });
});

// ===== GLOBAL ERROR HANDLER =====
app.use((err, req, res, next) => {
  console.error("GLOBAL ERROR:", err);

  res.status(500).json({
    error: "Internal Server Error",
  });
});

// ===== START SERVER =====
const PORT = Number(process.env.PORT) || 5000;
const HOST = "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Server running on port ${PORT}`);
});