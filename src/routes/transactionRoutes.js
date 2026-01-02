const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/transactionController");

// Protect all transaction routes
router.use(auth);

// List transactions with filters + pagination
router.get("/", ctrl.list);

// Create new transaction
router.post("/", ctrl.create);

// Get transaction by id
router.get("/:id", ctrl.getById);

// Update transaction
router.patch("/:id", ctrl.update);

// Delete transaction
router.delete("/:id", ctrl.remove);

module.exports = router;

