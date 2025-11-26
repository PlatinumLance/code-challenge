### Express CRUD API with TypeScript
## A simple back-end server built with Express + TypeScript + SQLite (better-sqlite3).

## 📌 Features

- Create a resource
- List resource with optional filters
- Get details of a resource by ID
- Update a resource
- Delete a resource
- SQLite database with automatic table creation

## 📁 Project Structure

```bash
problem5/
│── src/
│   ├── models/
│   │   ├── db.ts              # SQLite connection + table creation
│   │   └── resource.ts        # Resource model + query functions
│   ├── routes/
│   │   └── resource.ts        # CRUD REST endpoints
│   └── index.ts               # Express server entrypoint
│
├── database.db                # SQLite database file
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Start development server

```bash
npm run dev
```

The server run at:
```bash
http://localhost:3000
```

## 🗄️ Database
A SQLite file named `database.db` is created automatically.

The `resources` table schema:

| Column      | Type    | Notes                      |
| ----------- | ------- | -------------------------- |
| id          | INTEGER | Primary key, autoincrement |
| name        | TEXT    | Required                   |
| description | TEXT    | Optional                   |

## 🔌 API Endpoints

### 1. Create Resource

POST `/resource`

Body:

```json
{
  "name": "Example name",
  "description": "Optional example description"
}
```

Response:

```json
{
  "id": 1,
  "name": "Example",
  "description": "Optional text"
}
```

### 2. List resource (with optional filters)
Optional Query Parameters

| Query         | Description                          |
|---------------|--------------------------------------|
| `name`        | Partial match on name                |
| `description` | Partial match on description         |
| `search`      | Partial match on name OR description |

Examples:

```
GET /resource
GET /resource?name=book
GET /resource?description=the Goblet of Fire
GET /resource?search=hello
```

### 3. Get resource by ID
Get `/resource/:id`

Example:
```
GET /resource/3
```

### 4. Update Resource

PUT `/resource/:id`

Body:

```json
{
  "id": 1,
  "name": "Updated Name",
  "description": "Updated description"
}
```

### 5. Delete Resource

DELETE `/resource/:id`

Success:

```json
{
  "message": "Resource deleted"
}
```

Not found:

```json
{
  "error": "Resource not found"
}
```

Invalid:

```json
{
  "error": "Invalid ID"
}
```

## 🧪 Testing the API

You can test using:

- Postman
- curl
- browser (for REST requests)
- VSCode REST Client

Example with curl:

```bash
curl http://localhost:3000/resource?search=test
```

## Notes

- SQLite is embedded — no external DB needed.
- All queries are synchronous (better-sqlite3 handles this safely).