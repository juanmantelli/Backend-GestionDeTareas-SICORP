import app from "./app.js";
import sequelize from "./config/db.js"; // Cambia connectDB por sequelize

sequelize.authenticate()
  .then(() => {
    console.log("Conexión a MySQL exitosa");
    // Sincroniza los modelos y crea las tablas si no existen
    return sequelize.sync();
  })
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error("Error de conexión o sincronización:", err);
  });

export default app;