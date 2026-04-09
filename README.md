# Puntos de Destreza - Leaderboard

Una web moderna y visualmente impactante que muestra una tabla de clasificación de jugadores con puntos de destreza, sincronizada en tiempo real con Google Sheets.

![Vista previa](preview.png)

## Características

- **Sincronización en tiempo real** con Google Sheets
- **Diseño cyberpunk/neón** inspirado en el template Playza
- **Actualización automática** cada 30 segundos
- **Búsqueda y filtrado** de jugadores
- **Ordenamiento** por puntos o nombre
- **Responsive** - funciona en móvil y desktop
- **Sin build necesario** - HTML, CSS y JS puro
- **Lista para GitHub Pages**

## Configuración de Google Sheets

Para que la web pueda acceder a tu hoja de cálculo, necesitas hacerla pública:

### Paso 1: Publicar la hoja

1. Abre tu Google Sheet: [https://docs.google.com/spreadsheets/d/1cSlIRsbVTvSKKWCe_28wpMeAwkAQa5k9edWzDgpQ9Ak/edit](https://docs.google.com/spreadsheets/d/1cSlIRsbVTvSKKWCe_28wpMeAwkAQa5k9edWzDgpQ9Ak/edit)

2. Ve a **Archivo** → **Compartir** → **Publicar en la web**

3. En el diálogo que aparece:
   - Selecciona la hoja **"PTS DESTREZA"**
   - Selecciona formato **"Valores separados por comas (.csv)"**
   - Haz clic en **"Publicar"**

4. Copia el enlace generado (lo necesitarás para verificar)

### Paso 2: Configurar permisos (alternativa)

Si el paso 1 no funciona, también puedes:

1. Haz clic en el botón **"Compartir"** (arriba a la derecha)
2. Cambia de **"Restringido"** a **"Cualquiera con el enlace"**
3. Selecciona permiso **"Lector"**
4. Haz clic en **"Listo"**

## Estructura de la tabla

La web espera que tu hoja tenga esta estructura:

```
Hoja: "PTS DESTREZA"

| B2      | C2     | D2      | E2      | F2      | G2      |
|---------|--------|---------|---------|---------|---------|
| Nombre  | Puntos | Stat 1  | Stat 2  | Stat 3  | Stat 4  |
| Juan    | 1500   | 100     | 200     | 300     | 400     |
| María   | 2300   | 150     | 250     | 350     | 450     |
| ...     | ...    | ...     | ...     | ...     | ...     |
```

- **Fila 2 (B2:G2)**: Headers de la tabla
- **Fila 3 en adelante**: Datos de los jugadores
- **Columna B**: Nombre del jugador
- **Columna C**: Puntos (se muestra con formato especial)
- **Columnas D-G**: Estadísticas adicionales

## Personalización

### Cambiar el ID del spreadsheet

Si quieres usar otro spreadsheet, edita el archivo `app.js`:

```javascript
// Línea 12
const SHEET_ID = 'TU_NUEVO_ID_AQUI';
```

El ID está en la URL de tu Google Sheet:
`https://docs.google.com/spreadsheets/d/`**`1cSlIRsbVTvSKKWCe_28wpMeAwkAQa5k9edWzDgpQ9Ak`**`/edit`

### Cambiar el nombre de la hoja

```javascript
// Línea 13
const SHEET_NAME = 'NOMBRE_DE_TU_HOJA';
```

### Cambiar el rango de datos

```javascript
// Línea 14-15
const HEADER_RANGE = 'B2:G2';  // Rango de los headers
const DATA_RANGE = 'B3:G';      // Rango de los datos (sin límite)
```

### Cambiar el intervalo de actualización

```javascript
// Línea 21 (en milisegundos)
const REFRESH_INTERVAL = 30000; // 30 segundos
```

## Despliegue en GitHub Pages

### Paso 1: Crear un repositorio

1. Ve a [GitHub](https://github.com) e inicia sesión
2. Crea un nuevo repositorio llamado `puntos-destreza` (o el nombre que prefieras)
3. **No** inicialices con README (ya lo tenemos)

### Paso 2: Subir los archivos

#### Opción A: Por web

1. En tu repositorio, haz clic en **"Add file"** → **"Upload files"**
2. Sube los 3 archivos: `index.html`, `styles.css`, `app.js`
3. Haz clic en **"Commit changes"**

#### Opción B: Por línea de comandos

```bash
# En la carpeta del proyecto
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/puntos-destreza.git
git push -u origin main
```

### Paso 3: Activar GitHub Pages

1. En tu repositorio, ve a **Settings** → **Pages**
2. En **Source**, selecciona **"Deploy from a branch"**
3. Selecciona la rama **"main"** y la carpeta **"/ (root)"**
4. Haz clic en **"Save"**

5. Espera 1-2 minutos y tu web estará disponible en:
   `https://TU_USUARIO.github.io/puntos-destreza`

## Solución de problemas

### "Error al cargar los datos"

1. Verifica que la hoja esté publicada (ver "Configuración de Google Sheets")
2. Comprueba que el ID del spreadsheet sea correcto
3. Asegúrate de que el nombre de la hoja sea exacto (distingue mayúsculas/minúsculas)

### Los datos no se actualizan

- Google Sheets puede tardar hasta 5 minutos en propagar los cambios cuando se publica como CSV
- La web se actualiza automáticamente cada 30 segundos
- Puedes forzar una actualización haciendo clic en el botón "Actualizar"

### La tabla aparece vacía

- Verifica que los datos estén en el rango correcto (B2:G)
- Asegúrate de que la primera fila (B2:G2) contenga los headers
- Los datos deben empezar desde la fila 3 (B3)

## Tecnologías utilizadas

- **HTML5** - Estructura semántica
- **CSS3** - Estilos con variables CSS, flexbox, grid
- **JavaScript ES6+** - Lógica de la aplicación, fetch API
- **Google Sheets API** - Fuente de datos
- **Fuentes**: Inter, JetBrains Mono (Google Fonts)

## Licencia

Este proyecto está basado en el template [Playza](https://github.com/mikelothar/template-playza) y mantiene su estilo visual cyberpunk.

---

¿Necesitas ayuda? Abre un issue en el repositorio o contacta al desarrollador.
