module.exports = (req,res,next)=>{
  const { type, amount } = req.body;
  if(!type || !amount) return res.status(400).json({msg:"Invalid transaction"});
  next();
};
