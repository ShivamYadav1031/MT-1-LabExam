// Part A: Built-in HTTP and FS modules (NO Express in this file)

const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;

// In-memory vehicle records for the HTTP server
const vehicles = [
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

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function isValidVehicle(vehicle) {
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
    typeof vehicle.vehicleNumber === "string" &&
    typeof vehicle.type === "string" &&
    Number.isFinite(Number(vehicle.price)) &&
    Number(vehicle.price) > 0
  );
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk;

      // Prevent unnecessarily large request bodies.
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });

    req.on("end", () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });

    req.on("error", reject);
  });
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = requestUrl.pathname;

  // A2: GET /
  if (req.method === "GET" && pathname === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    return res.end(`<!DOCTYPE html>
<html>
<head><title>Vehicle Management</title></head>
<body>
  <h1>Welcome to Vehicle Management</h1>
  <p>Node.js HTTP and FS module practical application.</p>
  <p>Try <a href="/vehicles">/vehicles</a>, <a href="/about">/about</a> and <a href="/info">/info</a>.</p>
</body>
</html>`);
  }

  // A2/A3: GET /vehicles
  if (req.method === "GET" && pathname === "/vehicles") {
    return sendJSON(res, 200, vehicles);
  }

  // A2: GET /about
  if (req.method === "GET" && pathname === "/about") {
    return sendJSON(res, 200, {
      application: "Vehicle Management Web Application",
      description: "A Node.js application demonstrating HTTP routing, JSON handling and static file serving.",
      technologies: ["Node.js", "HTTP module", "FS module"],
      port: PORT
    });
  }

  // A2/A4: GET /info - serve a static HTML file using fs.readFile()
  if (req.method === "GET" && pathname === "/info") {
    const filePath = path.join(__dirname, "public", "info.html");

    return fs.readFile(filePath, "utf8", (error, data) => {
      if (error) {
        return sendJSON(res, 500, { error: "Unable to read public/info.html" });
      }

      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(data);
    });
  }

  // A3: POST /add-vehicle
  if (req.method === "POST" && pathname === "/add-vehicle") {
    try {
      const newVehicle = await readRequestBody(req);

      if (!isValidVehicle(newVehicle)) {
        return sendJSON(res, 400, {
          error: "Invalid vehicle data. Required: id, vehicleName, vehicleNumber, type and positive price."
        });
      }

      const vehicleId = Number(newVehicle.id);
      if (vehicles.some((vehicle) => vehicle.id === vehicleId)) {
        return sendJSON(res, 400, { error: "A vehicle with this ID already exists." });
      }

      const vehicleToAdd = {
        id: vehicleId,
        vehicleName: newVehicle.vehicleName.trim(),
        vehicleNumber: newVehicle.vehicleNumber.trim(),
        type: newVehicle.type.trim(),
        price: Number(newVehicle.price)
      };

      vehicles.push(vehicleToAdd);
      return sendJSON(res, 201, {
        message: "Vehicle added successfully",
        vehicle: vehicleToAdd
      });
    } catch (error) {
      const statusCode = error.message === "Invalid JSON" ? 400 : 400;
      return sendJSON(res, statusCode, { error: error.message });
    }
  }

  // A5: Every unsupported method/path returns 404
  return sendJSON(res, 404, { error: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
