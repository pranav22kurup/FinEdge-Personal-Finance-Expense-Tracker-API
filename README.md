## FinEdge – Personal Finance & Expense Tracker API


A Node.js based FinEdge – Personal Finance & Expense Tracker API that allows users to securely manage income, expenses, budgets and view financial summaries.

---

## FEATURES

* User Registration & Login with JWT Authentication
* User-wise Transaction Management
* Income / Expense Tracking
* Monthly Financial Summary (Income, Expense, Balance)
* File-based JSON Data Persistence
* Modular MVC Architecture
* Request Logging, Validation & Global Error Handling
* Analytics & Reporting
* Environment Variable Configuration

---

## TECH STACK

* Node.js
* Express.js
* JWT Authentication
* bcryptjs for password hashing
* fs/promises for JSON database
* UUID for unique IDs
* Jest & Supertest for testing

---

## PROJECT STRUCTURE

src/
app.js
routes/
userRoutes.js
transactionRoutes.js
controllers/
userController.js
transactionController.js
services/
userService.js
transactionService.js
models/
userModel.js
transactionModel.js
middleware/
auth.js
logger.js
validator.js
errorHandler.js
utils/
analytics.js
data/
users.json
transactions.json

---

## SETUP INSTRUCTIONS

1. Clone Repository
   git clone [https://github.com/your-username/finance-manager-api.git](https://github.com/your-username/finance-manager-api.git)
   cd finance-manager-api

2. Install Dependencies
   npm install

3. Create .env file
   JWT_SECRET=finance_super_secret_key

4. Start Server
   npm run dev

Server runs on [http://localhost:5000](http://localhost:5000)

---

## API ENDPOINTS

AUTHENTICATION
POST   /users/register   Register new user
POST   /users/login      Login user

TRANSACTIONS (Protected)
POST   /transactions     Add income or expense
GET    /transactions     Fetch all user transactions
PATCH  /transactions/:id Update transaction
DELETE /transactions/:id Delete transaction

Pass JWT Token in Header:
Authorization: Bearer <token>

ANALYTICS
GET /summary   Fetch income, expense and balance

---

## SAMPLE TRANSACTION BODY

{
"type": "income",
"category": "Salary",
"amount": 50000,
"date": "2025-01-10"
}

---

## SECURITY

* Passwords hashed using bcryptjs
* JWT tokens valid for 1 day
* All transaction routes protected

---

## LICENSE

MIT License © 2025

---

## Transactions API Details

- Base: `/transactions` (requires `Authorization: Bearer <token>`)
- Filters (GET `/transactions`): `type`, `category`, `startDate`, `endDate`, `minAmount`, `maxAmount`, `sortBy` (date|amount|category), `sortOrder` (asc|desc), `page`, `limit`.
- Responses:
   - List: `{ total, page, limit, items: Transaction[] }`
   - Create: `201` with `Transaction`
   - Get: `200` with `Transaction` or `404`
   - Update: `200` with `Transaction` or `400/404`
   - Delete: `204` or `404`

### Windows Quick Start (PowerShell)

```powershell
cd "c:\Users\Pranav\FinEdge-Personal-Finance-Expense-Tracker-API"
npm install

# Ensure data files
Set-Content -Path .\src\data\users.json -Value "[]" -NoNewline
# transactions.json will be created automatically on first write

# Create .env
Set-Content -Path .\.env -Value "JWT_SECRET=finance_super_secret_key" -NoNewline

npm run start

# Register and login
$reg = @{ email = "test@example.com"; password = "Passw0rd!" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:5000/users/register -ContentType 'application/json' -Body $reg
$token = (Invoke-RestMethod -Method Post -Uri http://localhost:5000/users/login -ContentType 'application/json' -Body $reg).token

# Create transaction
$tBody = @{ type = "expense"; amount = 19.99; category = "food"; note = "lunch" } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://localhost:5000/transactions -Headers @{ Authorization = "Bearer $token" } -ContentType 'application/json' -Body $tBody

# List transactions
Invoke-RestMethod -Method Get -Uri http://localhost:5000/transactions -Headers @{ Authorization = "Bearer $token" }
```
