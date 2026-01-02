const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const {
	validateTransactionInput,
	normalizeTransaction,
} = require("../models/transactionModel");

const DATA_FILE = path.join(__dirname, "../data/transactions.json");

async function ensureDataFile() {
	try {
		await fsp.access(DATA_FILE, fs.constants.F_OK);
	} catch {
		await fsp.mkdir(path.dirname(DATA_FILE), { recursive: true });
		await fsp.writeFile(DATA_FILE, "[]", "utf8");
	}
}

async function readAll() {
	await ensureDataFile();
	const raw = await fsp.readFile(DATA_FILE, "utf8");
	if (!raw.trim()) return [];
	try {
		const data = JSON.parse(raw);
		return Array.isArray(data) ? data : [];
	} catch {
		// Reset corrupted file
		await fsp.writeFile(DATA_FILE, "[]", "utf8");
		return [];
	}
}

async function writeAll(items) {
	const payload = JSON.stringify(items, null, 2);
	await fsp.writeFile(DATA_FILE, payload, "utf8");
}

function inDateRange(tx, startDate, endDate) {
	const t = new Date(tx.date).getTime();
	if (startDate) {
		const s = new Date(startDate).getTime();
		if (Number.isNaN(s) || t < s) return false;
	}
	if (endDate) {
		const e = new Date(endDate).getTime();
		if (Number.isNaN(e) || t > e) return false;
	}
	return true;
}

function inAmountRange(tx, minAmount, maxAmount) {
	const a = Number(tx.amount);
	if (minAmount != null && a < Number(minAmount)) return false;
	if (maxAmount != null && a > Number(maxAmount)) return false;
	return true;
}

async function createTransaction(userId, input) {
	const { valid, errors } = validateTransactionInput(input);
	if (!valid) {
		const err = new Error(errors.join("; "));
		err.status = 400;
		throw err;
	}

	const all = await readAll();
	const tx = normalizeTransaction(userId, input);
	tx.id = uuidv4();
	await writeAll([...all, tx]);
	return tx;
}

async function listTransactions(userId, filters = {}) {
	const all = await readAll();
	const {
		type,
		category,
		startDate,
		endDate,
		minAmount,
		maxAmount,
		sortBy = "date",
		sortOrder = "desc",
		page = 1,
		limit = 50,
	} = filters;

	let items = all.filter((t) => t.userId === userId);

	if (type) items = items.filter((t) => String(t.type).toLowerCase() === String(type).toLowerCase());
	if (category) items = items.filter((t) => String(t.category).toLowerCase() === String(category).toLowerCase());
	if (startDate || endDate) items = items.filter((t) => inDateRange(t, startDate, endDate));
	if (minAmount != null || maxAmount != null) items = items.filter((t) => inAmountRange(t, minAmount, maxAmount));

	items.sort((a, b) => {
		let av = a[sortBy];
		let bv = b[sortBy];
		if (sortBy === "date" || sortBy === "createdAt" || sortBy === "updatedAt") {
			av = new Date(av).getTime();
			bv = new Date(bv).getTime();
		}
		if (av < bv) return sortOrder === "asc" ? -1 : 1;
		if (av > bv) return sortOrder === "asc" ? 1 : -1;
		return 0;
	});

	const pageNum = Math.max(1, Number(page));
	const lim = Math.max(1, Number(limit));
	const start = (pageNum - 1) * lim;
	const paged = items.slice(start, start + lim);

	return {
		total: items.length,
		page: pageNum,
		limit: lim,
		items: paged,
	};
}

async function getTransactionById(userId, id) {
	const all = await readAll();
	const tx = all.find((t) => t.id === id && t.userId === userId);
	return tx || null;
}

async function updateTransaction(userId, id, updates) {
	const all = await readAll();
	const idx = all.findIndex((t) => t.id === id && t.userId === userId);
	if (idx === -1) return null;

	// Merge updates, validate, and normalize
	const merged = { ...all[idx], ...updates };
	const { valid, errors } = validateTransactionInput(merged);
	if (!valid) {
		const err = new Error(errors.join("; "));
		err.status = 400;
		throw err;
	}

	const normalized = normalizeTransaction(userId, merged);
	normalized.id = all[idx].id;
	normalized.createdAt = all[idx].createdAt; // preserve

	all[idx] = normalized;
	await writeAll(all);
	return normalized;
}

async function deleteTransaction(userId, id) {
	const all = await readAll();
	const idx = all.findIndex((t) => t.id === id && t.userId === userId);
	if (idx === -1) return false;
	all.splice(idx, 1);
	await writeAll(all);
	return true;
}

module.exports = {
	createTransaction,
	listTransactions,
	getTransactionById,
	updateTransaction,
	deleteTransaction,
};

