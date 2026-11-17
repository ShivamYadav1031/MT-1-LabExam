// Part B: Vehicle Management REST API using Express.js

const express = require("express");

const app = express();
const PORT = 4000;

// Middleware: parse incoming JSON request bodies
app.use(express.json());

// In-memory array: no database is required
let vehicles = [
  {
    id: 1,
    vehicleName: "Hyundai Creta",
    vehicleNumber: "HR26AB1234",
    type: "SUV",
    price: 1500000
  },
  {
    id: 2,
    vehicleName: "Honda City",
    vehicleNumber: "DL3CAB4567",
    type: "Sedan",
    price: 1200000
  },
  {
    id: 3,
    vehicleName: "Royal Enfield Classic 350",
    vehicleNumber: "UP14CD7890",
    type: "Bike",
    price: 220000
  }
];

const requiredFields = ["id", "vehicleName", "vehicleNumber", "type", "price"];

function hasRequiredVehicleFields(vehicle) {
  return (
    vehicle &&
    typeof vehicle === "object" &&
    !Array.isArray(vehicle) &&
    requiredFields.every((field) =>
      Object.prototype.hasOwnProperty.call(vehicle, field) &&
      vehicle[field] !== "" &&
      vehicle[field] !== null &&
      vehicle[field] !== undefined
    ) &&
    Number.isInteger(Number(vehicle.id)) &&
    Number(vehicle.id) > 0 &&
    typeof vehicle.vehicleName === "string" &&
    vehicle.vehicleName.trim().length > 0 &&
    typeof vehicle.vehicleNumber === "string" &&
    vehicle.vehicleNumber.trim().length > 0 &&
    typeof vehicle.type === "string" &&
    vehicle.type.trim().length > 0 &&
    Number.isFinite(Number(vehicle.price)) &&
    Number(vehicle.price) > 0
  );
}

// Handle malformed JSON bodies
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    return res.status(400).json({ error: "Invalid JSON request body" });
  }
  return next(error);
});

// GET /vehicles - retrieve all vehicles
app.get("/vehicles", (req, res) => {
  return res.status(200).json(vehicles);
});

// GET /vehicles/:id - retrieve one vehicle by ID
app.get("/vehicles/:id", (req, res) => {
  const vehicleId = Number(req.params.id);

  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return res.status(400).json({ error: "Vehicle ID must be a positive integer" });
  }

  const vehicle = vehicles.find((item) => item.id === vehicleId);

  if (!vehicle) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  return res.status(200).json(vehicle);
});

// POST /vehicles - add a new vehicle
app.post("/vehicles", (req, res) => {
  const newVehicle = req.body;

  if (!hasRequiredVehicleFields(newVehicle)) {
    return res.status(400).json({
      error: "Invalid vehicle data. Required: id, vehicleName, vehicleNumber, type and positive price."
    });
  }

  const vehicleId = Number(newVehicle.id);

  if (vehicles.some((vehicle) => vehicle.id === vehicleId)) {
    return res.status(400).json({ error: "A vehicle with this ID already exists." });
  }

  const vehicleToAdd = {
    id: vehicleId,
    vehicleName: newVehicle.vehicleName.trim(),
    vehicleNumber: newVehicle.vehicleNumber.trim(),
    type: newVehicle.type.trim(),
    price: Number(newVehicle.price)
  };

  vehicles.push(vehicleToAdd);

  return res.status(201).json({
    message: "Vehicle added successfully",
    vehicle: vehicleToAdd
  });
});

// PUT /vehicles/:id - update vehicle details.
// This implementation supports partial updates; omitted fields keep old values.
app.put("/vehicles/:id", (req, res) => {
  const vehicleId = Number(req.params.id);

  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return res.status(400).json({ error: "Vehicle ID must be a positive integer" });
  }

  const index = vehicles.findIndex((vehicle) => vehicle.id === vehicleId);

  if (index === -1) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  const updates = req.body;

  if (!updates || typeof updates !== "object" || Array.isArray(updates)) {
    return res.status(400).json({ error: "Request body must be a JSON object" });
  }

  // Do not allow changing the ID through the request body.
  if (Object.prototype.hasOwnProperty.call(updates, "id") &&
      Number(updates.id) !== vehicleId) {
    return res.status(400).json({ error: "Vehicle ID cannot be changed" });
  }

  const allowedFields = ["vehicleName", "vehicleNumber", "type", "price"];
  const unknownFields = Object.keys(updates).filter(
    (field) => field !== "id" && !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    return res.status(400).json({
      error: `Unknown field(s): ${unknownFields.join(", ")}`
    });
  }

  const updatedVehicle = { ...vehicles[index], ...updates, id: vehicleId };

  if (
    typeof updatedVehicle.vehicleName !== "string" ||
    updatedVehicle.vehicleName.trim().length === 0 ||
    typeof updatedVehicle.vehicleNumber !== "string" ||
    updatedVehicle.vehicleNumber.trim().length === 0 ||
    typeof updatedVehicle.type !== "string" ||
    updatedVehicle.type.trim().length === 0 ||
    !Number.isFinite(Number(updatedVehicle.price)) ||
    Number(updatedVehicle.price) <= 0
  ) {
    return res.status(400).json({
      error: "Invalid update. Vehicle name, number, type and positive price are required."
    });
  }

  updatedVehicle.vehicleName = updatedVehicle.vehicleName.trim();
  updatedVehicle.vehicleNumber = updatedVehicle.vehicleNumber.trim();
  updatedVehicle.type = updatedVehicle.type.trim();
  updatedVehicle.price = Number(updatedVehicle.price);

  vehicles[index] = updatedVehicle;

  return res.status(200).json({
    message: "Vehicle updated successfully",
    vehicle: updatedVehicle
  });
});

// DELETE /vehicles/:id - delete a vehicle
app.delete("/vehicles/:id", (req, res) => {
  const vehicleId = Number(req.params.id);

  if (!Number.isInteger(vehicleId) || vehicleId <= 0) {
    return res.status(400).json({ error: "Vehicle ID must be a positive integer" });
  }

  const index = vehicles.findIndex((vehicle) => vehicle.id === vehicleId);

  if (index === -1) {
    return res.status(404).json({ error: "Vehicle not found" });
  }

  const deletedVehicle = vehicles.splice(index, 1)[0];

  return res.status(200).json({
    message: "Vehicle deleted successfully",
    vehicle: deletedVehicle
  });
});

// Invalid routes
app.use((req, res) => {
  return res.status(404).json({ error: "Route not found" });
});

// General server-side error handler
app.use((error, req, res, next) => {
  console.error(error);
  return res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
