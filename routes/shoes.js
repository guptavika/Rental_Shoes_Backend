import express from "express";
import db from "../db.js";
import multer from "multer";
import path from "path";

const router = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// CREATE
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    const { name, brand, price, sizes } = req.body;
    const image = req.file.filename;

    await db.query(
      "INSERT INTO shoes (name,brand,price,sizes,image) VALUES (?,?,?,?,?)",
      [name, brand, price, sizes, image]
    );

    res.json({ message: "Shoe added" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// READ
router.get("/", async (req, res) => {
  const [rows] = await db.query("SELECT * FROM shoes");
  res.json(rows);
});

// UPDATE
router.put("/:id", upload.single("image"), async (req, res) => {
  const { name, brand, price, sizes } = req.body;
  let query = "UPDATE shoes SET name=?, brand=?, price=?, sizes=?";
  let values = [name, brand, price, sizes];

  if (req.file) {
    query += ", image=?";
    values.push(req.file.filename);
  }

  query += " WHERE id=?";
  values.push(req.params.id);

  await db.query(query, values);
  res.json({ message: "Updated" });
});

// DELETE
router.delete("/:id", async (req, res) => {
  await db.query("DELETE FROM shoes WHERE id=?", [req.params.id]);
  res.json({ message: "Deleted" });
});

export default router;
