import express from "express";
import db from "../db.js";
import { auth } from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= ADD TO CART =================
router.post("/", auth(), async (req, res) => {
  try {
    const { shoe_id } = req.body;
    const user_id = req.user.id;

    const [exist] = await db.query(
      "SELECT * FROM cart WHERE user_id=? AND shoe_id=?",
      [user_id, shoe_id],
    );

    if (exist.length > 0) {
      await db.query("UPDATE cart SET quantity = quantity + 1 WHERE id=?", [
        exist[0].id,
      ]);
    } else {
      await db.query(
        "INSERT INTO cart (user_id, shoe_id, quantity) VALUES (?,?,1)",
        [user_id, shoe_id],
      );
    }

    res.json({
      success: true,
      message: "Added to Cart",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ================= GET CART =================
router.get("/", auth(), async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT
          cart.id,
          cart.quantity,
          shoes.id AS shoe_id,
          shoes.name,
          shoes.brand,
          shoes.price,
          shoes.image
       FROM cart
       JOIN shoes ON cart.shoe_id = shoes.id
       WHERE cart.user_id=?`,
      [req.user.id],
    );

    res.json(rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

// ================= REMOVE CART =================
router.delete("/:id", auth(), async (req, res) => {
  try {
    await db.query("DELETE FROM cart WHERE id=? AND user_id=?", [
      req.params.id,
      req.user.id,
    ]);

    res.json({
      success: true,
      message: "Item Removed Successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;
