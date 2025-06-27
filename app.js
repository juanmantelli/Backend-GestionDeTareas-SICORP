import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import clientesRoutes from "./routes/client.routes.js";
import sistemasRoutes from "./routes/systems.routes.js";
import categoriasRoutes from "./routes/categories.routes.js";
import ticketsRoutes from "./routes/tickets.routes.js";
import informesRoutes from "./routes/reports.routes.js";

dotenv.config();

const app = express();

// Middleware
const allowedOrigins = ['https://sicorp-ticket.netlify.app', 'http://localhost:5173'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/clientes", clientesRoutes);
app.use("/api/sistemas", sistemasRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/tickets", ticketsRoutes);
app.use("/api/informes", informesRoutes);

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando...");
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ message: "Ruta no encontrada" });
});

export default app;