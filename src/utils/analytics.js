const router = require("express").Router();
const fs = require("fs/promises");
const auth = require("../middleware/auth");

router.use(auth);
router.get("/", async(req,res)=>{
  const txns = JSON.parse(await fs.readFile("./src/data/transactions.json"));
  let income=0, expense=0;

  txns.forEach(t=>{
    t.type==="income" ? income+=t.amount : expense+=t.amount;
  });

  res.json({ income, expense, balance: income-expense });
});

module.exports = router;