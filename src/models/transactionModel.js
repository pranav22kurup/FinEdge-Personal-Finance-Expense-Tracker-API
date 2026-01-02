// Transaction model utilities: validation and normalization

const VALID_TYPES = ["income", "expense"]; // transaction types

function isValidType(type) {
	return VALID_TYPES.includes(String(type).toLowerCase());
}

function parseISODate(date) {
	if (!date) return new Date().toISOString();
	const d = new Date(date);
	if (Number.isNaN(d.getTime())) {
		throw new Error("Invalid date format; expected ISO or parsable string");
	}
	return d.toISOString();
}

function validateTransactionInput(input) {
	const errors = [];

	if (!isValidType(input.type)) {
		errors.push("type must be 'income' or 'expense'");
	}

	const amountNum = Number(input.amount);
	if (!Number.isFinite(amountNum) || amountNum < 0) {
		errors.push("amount must be zero or a positive number");
	}

	if (input.category != null && String(input.category).trim().length === 0) {
		errors.push("category, if provided, must be a non-empty string");
	}

	// date validation if provided
	if (input.date != null) {
		try {
			parseISODate(input.date);
		} catch (e) {
			errors.push(e.message);
		}
	}

	return {
		valid: errors.length === 0,
		errors,
	};
}

function normalizeTransaction(userId, input) {
	const now = new Date().toISOString();
	return {
		id: input.id, // may be set by service
		userId,
		type: String(input.type).toLowerCase(),
		amount: Number(input.amount),
		category: input.category ? String(input.category).trim() : undefined,
		note: input.note ? String(input.note) : undefined,
		date: parseISODate(input.date),
		createdAt: input.createdAt || now,
		updatedAt: now,
	};
}

module.exports = {
	VALID_TYPES,
	validateTransactionInput,
	normalizeTransaction,
};

