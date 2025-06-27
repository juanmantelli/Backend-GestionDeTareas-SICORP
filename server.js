import app from "./app.js";
import sequelize from "./config/db.js";

sequelize.authenticate()
  .then(() => {
    console.log("Conexión a MySQL exitosa");
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