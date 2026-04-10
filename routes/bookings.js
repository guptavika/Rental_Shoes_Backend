import express from "express";
import db from "../db.js";
import { authenticate } from "../middleware/auth.js";

const router = express.Router();

// Checkout
router.post("/", authenticate, async (req, res) => {
  const user_id = req.user.id;

  const [cart] = await db.query("SELECT * FROM cart WHERE user_id=?", [user_id]);

  for (let item of cart) {
    await db.query(
      "INSERT INTO bookings (user_id,shoe_id,quantity,status) VALUES (?,?,?,?)",
      [user_id, item.shoe_id, item.quantity, "rented"]
    );

    await db.query(
      "UPDATE shoes SET quantity=quantity-? WHERE id=?",
      [item.quantity, item.shoe_id]
    );
  }

  await db.query("DELETE FROM cart WHERE user_id=?", [user_id]);

  res.json({ message: "Booked" });
});

// USER BOOKINGS
router.get("/", authenticate, async (req, res) => {
  const [data] = await db.query(
    `SELECT b.*,s.name FROM bookings b
     JOIN shoes s ON b.shoe_id=s.id
     WHERE b.user_id=?`,
    [req.user.id]
  );

  res.json(data);
});

// ADMIN ALL
router.get("/all", authenticate, async (req, res) => {
  const [data] = await db.query(
    `SELECT b.*,u.name as user_name,s.name as shoe_name
     FROM bookings b
     JOIN users u ON b.user_id=u.id
     JOIN shoes s ON b.shoe_id=s.id`
  );

  res.json(data);
});

// APPROVE
router.post("/approve/:id", authenticate, async (req, res) => {
  await db.query("UPDATE bookings SET status='approved' WHERE id=?", [
    req.params.id,
  ]);
  res.json({ message: "Approved" });
});

// RETURN
router.post("/return/:id", authenticate, async (req, res) => {
  const [b] = await db.query("SELECT * FROM bookings WHERE id=?", [
    req.params.id,
  ]);

  await db.query("UPDATE bookings SET status='returned' WHERE id=?", [
    req.params.id,
  ]);

  await db.query("UPDATE shoes SET quantity=quantity+? WHERE id=?", [
    b[0].quantity,
    b[0].shoe_id,
  ]);

  res.json({ message: "Returned" });
});

export default router;