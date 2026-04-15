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

# Puntos de Destreza - Leaderboard

**Puntos de Destreza** es una aplicación web interactiva que muestra un ranking de jugadores basado en datos en tiempo real provenientes de una hoja de cálculo de Google Sheets. El objetivo principal es ofrecer una visualización clara, atractiva y dinámica de la clasificación de jugadores, facilitando la gestión y el seguimiento de estadísticas en comunidades, torneos o grupos de juego.

## Descripción general

El proyecto consiste en una página web de estilo cyberpunk/neón, inspirada en el template Playza, que presenta una tabla de clasificación (leaderboard) con información relevante de cada jugador: nombre, puntos de destreza, partidas jugadas, victorias, derrotas, winrate y estadísticas adicionales. La información se sincroniza automáticamente con una hoja de Google Sheets, permitiendo que los datos estén siempre actualizados sin intervención manual.

## Arquitectura y funcionamiento

- **Frontend:**
   - Desarrollado en HTML, CSS y JavaScript puro, sin frameworks ni dependencias externas.
   - El diseño es responsive y está optimizado tanto para escritorio como para dispositivos móviles.
   - Incluye efectos visuales modernos y una experiencia de usuario fluida.

- **Sincronización de datos:**
   - Utiliza la API pública de Google Sheets para obtener los datos de la clasificación.
   - La tabla se actualiza automáticamente cada cierto intervalo de tiempo, mostrando siempre la información más reciente.
   - Permite búsqueda, filtrado y ordenamiento de jugadores por diferentes criterios (puntos, winrate, KDA, nombre, etc.).

- **Funcionalidades adicionales:**
   - Modal para crear partidas y generar equipos equilibrados de forma automática, seleccionando jugadores desde la lista.
   - Visualización de estadísticas individuales y totales.
   - Interfaz intuitiva para explorar y comparar el rendimiento de los jugadores.

## Motivación y casos de uso

Esta aplicación está pensada para comunidades de videojuegos, clubes deportivos, ligas amateur o cualquier grupo que requiera llevar un control transparente y visualmente atractivo de las estadísticas de sus miembros. Al centralizar los datos en Google Sheets, se facilita la edición y mantenimiento por parte de los organizadores, mientras que los participantes pueden consultar el ranking en tiempo real desde cualquier dispositivo.

## Tecnologías principales

- **HTML5** para la estructura semántica de la web.
- **CSS3** con variables, flexbox y grid para el diseño visual y responsivo.
- **JavaScript ES6+** para la lógica de la aplicación y la integración con Google Sheets.
- **Google Sheets API** como fuente de datos dinámica.
- **Fuentes**: Inter y JetBrains Mono desde Google Fonts.

## Licencia y créditos

El proyecto toma como base el template [Playza](https://github.com/mikelothar/template-playza) y respeta su estilo visual cyberpunk. El código es abierto y puede ser adaptado para otros fines similares.

---
Para más información técnica o colaboración, revisa el código fuente o contacta al autor mediante el repositorio.

