import express from "express";
import db from "../db.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ADD TO CART
router.post("/", auth(), async (req, res) => {
  try {
    const { shoe_id } = req.body; // ✅ quantity hata diya

    if (!shoe_id) {
      return res.status(400).json({ message: "shoe_id missing" });
    }

    if (!req.user?.id) {
      return res.status(401).json({ message: "User not found in token" });
    }

    await db.query(
      "INSERT INTO cart (user_id, shoe_id) VALUES (?,?)", // ✅ quantity hata diya
      [req.user.id, shoe_id]
    );

    res.json({ message: "Added to cart" });

  } catch (err) {
    console.error("🔥 CART ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

// GET CART
router.get("/", auth(), async (req, res) => {
  try {
    const [data] = await db.query(
      `SELECT c.id, s.name, s.price
       FROM cart c
       JOIN shoes s ON c.shoe_id = s.id
       WHERE c.user_id = ?`,  // ✅ quantity hata diya
      [req.user.id]
    );

    res.json(data);

  } catch (err) {
    console.error("🔥 GET CART ERROR:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;