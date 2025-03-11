# 📌 Backend - Aplicación de Gestión de Tareas  

Este es el backend de una aplicación de gestión de tareas, construido con **Node.js**, **Express** y **MongoDB**. Incluye autenticación con JWT, validaciones, pruebas con Jest y una API REST completa para la gestión de tareas.  

## 🚀 Tecnologías utilizadas  

- **Node.js** + **Express**  
- **MongoDB** + **Mongoose**  
- **JSON Web Tokens (JWT)**  
- **bcryptjs** (Encriptación de contraseñas)  
- **Jest** (Pruebas)  
- **MongoMemoryServer** (Base de datos en memoria para testing)  
- **dotenv** (Manejo de variables de entorno)  

## 📂 Instalación y configuración  

### 1️⃣ Clonar el repositorio  

```sh
git clone https://github.com/tu-usuario/tu-repositorio.git
cd backend
```

### 2️⃣ Instalar dependencias  

```sh
npm install
```

### 3️⃣ Configurar variables de entorno  

Crea un archivo **.env** en la raíz del backend y define las siguientes variables:  

```env
MONGO_URI=mongodb+srv://tudb.mongodb.net
JWT_SECRET=tu_secreto
PORT=5000
```


### 4️⃣ Ejecutar el servidor  

```sh
npm start
```

El backend se ejecutará en `http://localhost:5000` 🚀  

---

## 🛠 Endpoints principales  

| Método  | Endpoint            | Descripción                  |
|---------|---------------------|------------------------------|
| POST    | `/api/auth/register` | Registro de usuario         |
| POST    | `/api/auth/login`    | Inicio de sesión            |
| GET     | `/api/tasks`         | Obtener todas las tareas    |
| POST    | `/api/tasks`         | Crear una nueva tarea       |
| PUT     | `/api/tasks/:id`     | Editar una tarea            |
| DELETE  | `/api/tasks/:id`     | Eliminar una tarea          |

**Nota:** Para acceder a las rutas protegidas, es necesario incluir un **token JWT** en los headers (`Authorization: Bearer <token>`).  

---

## 🧪 Correr pruebas  

```sh
npm test
```

Las pruebas se ejecutarán con **Jest** y utilizarán **MongoMemoryServer** para simular la base de datos.  

---
