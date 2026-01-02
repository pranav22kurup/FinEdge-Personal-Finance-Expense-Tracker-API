const {
	createTransaction,
	listTransactions,
	getTransactionById,
	updateTransaction,
	deleteTransaction,
} = require("../services/transactionService");

exports.create = async (req, res, next) => {
	try {
		const tx = await createTransaction(req.userId, req.body);
		res.status(201).json(tx);
	} catch (err) {
		next(err);
	}
};

exports.list = async (req, res, next) => {
	try {
		const result = await listTransactions(req.userId, req.query);
		res.json(result);
	} catch (err) {
		next(err);
	}
};

exports.getById = async (req, res, next) => {
	try {
		const tx = await getTransactionById(req.userId, req.params.id);
		if (!tx) return res.status(404).json({ msg: "Transaction not found" });
		res.json(tx);
	} catch (err) {
		next(err);
	}
};

exports.update = async (req, res, next) => {
	try {
		const tx = await updateTransaction(req.userId, req.params.id, req.body);
		if (!tx) return res.status(404).json({ msg: "Transaction not found" });
		res.json(tx);
	} catch (err) {
		next(err);
	}
};

exports.remove = async (req, res, next) => {
	try {
		const ok = await deleteTransaction(req.userId, req.params.id);
		if (!ok) return res.status(404).json({ msg: "Transaction not found" });
		res.status(204).send();
	} catch (err) {
		next(err);
	}
};

