# 🔀 Guía de Git Flow del Proyecto

Este documento define el flujo de trabajo con Git (**Git Flow**) para el equipo de desarrollo del Trabajo Práctico de **Desarrollo de Software (DDS - UTN FRBA)**.

---

## 🌲 1. Estructura de Ramas

```
main (Entregas oficiales)
 └── develop (Integración)
      ├── feature/login-auth
      ├── feature/api-compras
      └── fix/cors-backend
```

### Ramas Principales (Permanentes)

| Rama | Descripción | Protección |
| :--- | :--- | :--- |
| `main` | Código estable, verificado y listo para entregas oficiales del TP. | 🔒 Protegida (Solo PR desde `develop`) |
| `develop` | Rama de integración continua. Todo desarrollo probado se integra aquí. | 🔒 Protegida (Solo PR con aprobación) |

### Ramas Temporales (De trabajo)

Nacen siempre a partir de `develop` y se eliminan al fusionarse (*merge*):

* **`feature/<nombre-feature>`**: Para desarrollar nuevas funcionalidades.  
  *Ejemplos:* `feature/login-usuario`, `feature/api-compras`, `feature/ui-tabla-proveedores`
* **`fix/<nombre-bug>`**: Para corrección de errores encontrados en `develop`.  
  *Ejemplos:* `fix/cors-backend`, `fix/validacion-formulario`
* **`release/<version-o-entrega>`**: Para congelar versiones previas a un hito de entrega del TP.  
  *Ejemplo:* `release/entrega-1`
* **`hotfix/<nombre-bug>`**: Para correcciones urgentes directamente sobre `main`.

---

## 📝 2. Convención de Commits (Conventional Commits)

Utilizamos mensajes de commit estructurados para facilitar la lectura del historial:

```bash
<tipo>(<alcance>): <descripción corta en presente y minúsculas>
```

### Tipos de Commits

* **`feat:`** Nueva funcionalidad.  
  *Ejemplo:* `feat(backend): agregar endpoint POST /compras`
* **`fix:`** Corrección de un error/bug.  
  *Ejemplo:* `fix(frontend): corregir desalineacion en formulario de registro`
* **`docs:`** Cambios exclusivamente en documentación.  
  *Ejemplo:* `docs: actualizar instruciones de instalacion en README`
* **`style:`** Formateo, comas, espacios (sin cambios en la lógica).  
  *Ejemplo:* `style(frontend): aplicar formato con prettier`
* **`refactor:`** Reestructuración de código sin alterar su comportamiento.  
  *Ejemplo:* `refactor(backend): extraer middleware de autenticacion`
* **`test:`** Incorporación o modificación de pruebas unitarias/integración.  
  *Ejemplo:* `test(backend): agregar pruebas unitarias para controlador de compras`

---

## 🔄 3. Flujo de Trabajo Paso a Paso (Paso a Paso)

### Paso 1: Actualizar `develop` en tu máquina
Antes de iniciar cualquier tarea, asegúrate de estar parado en `develop` y tener la versión más reciente:
```bash
git checkout develop
git pull origin develop
```

### Paso 2: Crear tu rama de trabajo
Crea una nueva rama a partir de `develop` con un nombre representativo:
```bash
git checkout -b feature/nombre-de-tu-tarea
```

### Paso 3: Trabajar y realizar commits
Haz cambios pequeños e incrementales con mensajes descriptivos:
```bash
git add .
git commit -m "feat(modulo): agregar validacion de inputs"
```

### Paso 4: Sincronizar tu rama con `develop` antes de subirla
Para evitar conflictos en GitHub, trae los cambios más recientes que hayan subido tus compañeros a `develop`:
```bash
git fetch origin
git rebase origin/develop
```
*(Si hay conflictos, resuélvelos localmente y continúa con `git rebase --continue`)*.

### Paso 5: Subir tu rama a GitHub
```bash
git push -u origin feature/nombre-de-tu-tarea
```

### Paso 6: Crear y revisar el Pull Request (PR)
1. Ve al repositorio en GitHub y haz clic en **Compare & pull request**.
2. Verifica que la rama destino sea **`develop`** (nunca `main` directamente para features).
3. Escribe un título y descripción clara del trabajo realizado.
4. Asigna a al menos **1 compañero de equipo como Revisor (Reviewer)**.
5. Una vez aprobado y pasados los chequeos (linter/tests), realiza el **Squash and merge**.
6. Borra la rama en GitHub y en tu máquina local:
   ```bash
   git checkout develop
   git pull origin develop
   git branch -d feature/nombre-de-tu-tarea
   ```

---