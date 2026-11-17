# MT1-LABEXAM — Vehicle Management Web Application

## Requirements
- Node.js and npm installed
- Postman (for API testing)

## Setup
Open a terminal in this project folder and run:

```bash
npm install
```

## Part A — Node.js HTTP + FS server (port 3000)

```bash
node httpServer.js
```

Open:
- http://localhost:3000/
- http://localhost:3000/vehicles
- http://localhost:3000/about
- http://localhost:3000/info

Add a vehicle with Postman:
- Method: `POST`
- URL: `http://localhost:3000/add-vehicle`
- Body → raw → JSON:

```json
{
  "id": 4,
  "vehicleName": "Maruti Swift",
  "vehicleNumber": "DL8CAF5030",
  "type": "Hatchback",
  "price": 750000
}
```

## Part B — Express REST API (port 4000)

Open a second terminal in the same folder:

```bash
node expressApp.js
```

Test these endpoints in Postman:

| Method | URL | Purpose |
|---|---|---|
| GET | http://localhost:4000/vehicles | Get all vehicles |
| GET | http://localhost:4000/vehicles/1 | Get vehicle with ID 1 |
| POST | http://localhost:4000/vehicles | Add a vehicle |
| PUT | http://localhost:4000/vehicles/1 | Update vehicle with ID 1 |
| DELETE | http://localhost:4000/vehicles/1 | Delete vehicle with ID 1 |

For POST, choose Body → raw → JSON and send:

```json
{
  "id": 4,
  "vehicleName": "Maruti Swift",
  "vehicleNumber": "DL8CAF5030",
  "type": "Hatchback",
  "price": 750000
}
```

Example PUT body (partial update):

```json
{
  "price": 800000
}
```

## Important notes
- Part A uses only built-in `http` and `fs` modules; it does not use Express.
- Part B uses Express and `express.json()`.
- Both servers use separate in-memory arrays and run independently.
- Data is reset to the sample records whenever the relevant server restarts.
- `screenshots/` is provided for your practical screenshots.
