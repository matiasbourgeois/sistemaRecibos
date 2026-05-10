# Sistema de Recibos v5.0 — Supreme Edition

> Aplicación de escritorio offline para generar recibos de haberes (liquidación de sueldos) en Argentina. Empaquetada con Electron, protegida por licencia por Machine ID.

---

## Índice

- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura de Archivos](#estructura-de-archivos)
- [Sistema de Licencias](#sistema-de-licencias)
- [Desarrollo Local](#desarrollo-local)
- [Build & Distribución](#build--distribución)
- [Troubleshooting](#troubleshooting)
- [Decisiones Técnicas](#decisiones-técnicas)

---

## Arquitectura

```
┌──────────────────────────────────────────────────────┐
│                    ELECTRON (main.js)                 │
│  ┌──────────────┐  ┌────────────┐  ┌──────────────┐ │
│  │  BrowserWindow│  │ license.js │  │ dialog (IPC) │ │
│  │  (Chromium)   │  │  AES-256   │  │  confirm()   │ │
│  └──────┬───────┘  └────────────┘  │  alert()     │ │
│         │                           └──────────────┘ │
│  ┌──────┴───────┐                                    │
│  │  preload.js  │ ← contextBridge (seguro)           │
│  │  IPC Bridge  │                                    │
│  └──────┬───────┘                                    │
│         │                                            │
│  ┌──────┴────────────────────────────────────────┐   │
│  │          SistemaRecibos.html (Renderer)        │   │
│  │  Vue 3 (CDN offline) + Tailwind CSS (offline)  │   │
│  │  FontAwesome 6 (offline) + Google Fonts (local)│   │
│  └───────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────┘
```

### Principios de diseño:
- **100% Offline** — Todo funciona sin internet. Libs incluidas en `/libs/`
- **Sin backend** — Los datos se guardan en `localStorage` del Chromium de Electron
- **Seguridad** — `contextIsolation: true`, el renderer NO tiene acceso a Node.js
- **Single file UI** — Todo el frontend vive en `SistemaRecibos.html` (~171KB)

---

## Stack Tecnológico

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| Electron | 28.3.3 | Shell de escritorio (Chromium + Node.js) |
| Vue 3 | 3.x (CDN prod) | Framework reactivo frontend |
| Tailwind CSS | 3.x (CDN) | Utilidades CSS |
| FontAwesome | 6.x | Iconografía |
| Inter + Roboto Mono | — | Tipografías (offline) |
| electron-builder | 24.13.3 | Empaquetado NSIS (.exe) |
| Node.js crypto | Built-in | Encriptación AES-256-CBC |

---

## Estructura de Archivos

```
sistemaRecibos-main/
├── SistemaRecibos.html      # 171KB — App completa (Vue 3 + CSS + JS)
│                             #   - Template HTML con todos los modales
│                             #   - Estilos (dark/light mode)
│                             #   - Lógica Vue (setup, computed, watch, etc.)
│                             #   - Override global de confirm/alert para Electron
│
├── main.js                   # Electron main process
│                             #   - Creación de BrowserWindow
│                             #   - IPC handlers (licencia, diálogos, PDF)
│                             #   - Anti-flicker (GPU disabled, ready-to-show)
│
├── license.js                # Sistema de licenciamiento
│                             #   - Machine ID (SHA-256 de hardware)
│                             #   - Encriptación AES-256-CBC
│                             #   - Auto-activación 365 días
│                             #   - Renovación por código
│
├── preload.js                # Bridge seguro renderer ↔ main
│                             #   - contextBridge API
│                             #   - IPC para licencia, print, dialogs
│
├── LicenseGenerator.html     # ⚠️ SOLO ADMIN — Generador de códigos de renovación
│                             #   - Abrirlo en cualquier navegador
│                             #   - NO va al cliente, es para Matías
│
├── icon.png                  # Ícono Dark Premium (420KB)
├── package.json              # Config + electron-builder
├── package-lock.json         # Lock de dependencias
├── .gitignore                # node_modules, dist, .license
│
├── libs/                     # Dependencias offline (NO usar CDN)
│   ├── vue.global.prod.js    # Vue 3 production build
│   ├── tailwindcss.js        # Tailwind CSS standalone
│   ├── fontawesome/          # FontAwesome 6 completo
│   │   ├── css/all.min.css
│   │   └── webfonts/*.woff2
│   └── fonts/                # Google Fonts locales
│       ├── inter-latin.woff2
│       └── roboto-mono-latin.woff2
│
├── dist/                     # Output del build (generado)
│   ├── Sistema de Recibos Setup 5.0.0.exe  # Installer NSIS (74MB)
│   ├── win-unpacked/         # Versión portable (~169MB)
│   └── latest.yml            # Metadata auto-update
│
└── node_modules/             # Dependencias dev (NO commitear)
```

---

## Sistema de Licencias

### Flujo de activación (primer uso)

```
1. Usuario instala el .exe
2. Abre la app por primera vez
3. license.js genera Machine ID:
   SHA-256(CPU + hostname + username + RAM + platform + MACs)
4. Crea archivo .license en %APPDATA%/sistema-recibos/
   - Encriptado con AES-256-CBC
   - Key derivada del Machine ID + salt
   - Contiene: fechaActivación, fechaExpiración (+365 días), machineId
5. App se abre normalmente → Sidebar muestra "Licencia Activa — 365 días"
```

### Protecciones

| Escenario | Resultado |
|-----------|-----------|
| Copiar `.license` a otra PC | ❌ Machine ID no coincide → rechazado |
| Modificar `.license` manualmente | ❌ Desencriptación falla → rechazado |
| Cambiar fecha del sistema | ⚠️ Podría funcionar temporalmente |
| Desinstalar y reinstalar | ✅ Se re-activa (mismo Machine ID) |
| Después de 365 días | ❌ Modal bloquea la app, pide código |

### Flujo de renovación (remoto)

```
1. Cliente ve modal "Licencia Expirada" con su Machine ID
2. Manda el Machine ID al admin (WhatsApp, mail, etc.)
3. Admin abre LicenseGenerator.html en su navegador
4. Pega Machine ID → elige duración → genera código
5. Manda el código al cliente
6. Cliente clickea "Tengo un código" → pega → renovado ✅
```

### Ubicación del archivo de licencia

```
C:\Users\[USUARIO]\AppData\Roaming\sistema-recibos\.license
```

### Constantes de seguridad (license.js)

```javascript
SALT = 'SistemaRecibos_Supreme_2026_Salt_Key'
ALGORITHM = 'aes-256-cbc'
DURATION = 365 días
```

---

## Desarrollo Local

### Requisitos

- Node.js 18+ (LTS)
- Windows 10/11 x64

### Instalar dependencias

```bash
cd sistemaRecibos-main
npm install
```

### Ejecutar en modo desarrollo

```bash
npm start
# o
npx electron .
```

### Probar en navegador (sin Electron)

```bash
# Cualquier server HTTP, por ejemplo:
npx http-server . -p 8800
# Abrir http://127.0.0.1:8800/SistemaRecibos.html
```

> **Nota:** En modo navegador la licencia no se verifica y los diálogos usan `confirm()`/`alert()` nativos del browser.

---

## Build & Distribución

### Generar installer .exe

```bash
npm run build
```

Output: `dist/Sistema de Recibos Setup 5.0.0.exe` (~74 MB)

### Generar versión portable

```bash
npm run build:portable
```

### Cambiar versión

Editar `version` en `package.json`:
```json
"version": "5.1.0"
```

El archivo de salida se nombrará automáticamente: `Sistema de Recibos Setup 5.1.0.exe`

### Distribuir

1. Copiar el `.exe` a un pendrive
2. Instalar en la PC target (doble click, Next, Next, Install)
3. Se crea acceso directo en escritorio y menú inicio
4. La licencia se activa automáticamente al primer uso

---

## Troubleshooting

### "Se traba después de un diálogo (confirm/alert)"
**Solución implementada:** Todos los `confirm()` y `alert()` se redirigen a `dialog.showMessageBoxSync()` de Electron vía IPC. Si vuelve a pasar, verificar que `preload.js` expone `showConfirm` y `showAlert`, y que `main.js` tiene los handlers `dialog:confirm` y `dialog:alert`.

### "Parpadea/flashea al abrir"
**Solución implementada:** 
- `app.disableHardwareAcceleration()` en `main.js`
- `show: false` + `ready-to-show` event
- `backgroundColor: '#0a0f1e'`

### "Aparecen empleados que no cargué"
**Solución implementada:** Se eliminó el bloque de migración legacy que creaba empleados de "SOL DEL AMANECER S.R.L." en primer uso. Ahora arranca vacío.

### "El zoom no se ajusta a mi pantalla"
**Solución implementada:** Auto-fit que escala hasta 150% en pantallas grandes. Si se ajusta manualmente (+/-), queda en modo manual (botón cyan). Click en el % resetea a auto-fit.

### "Quiero resetear toda la data"
Borrar: `%APPDATA%/sistema-recibos/` (licencia) y el localStorage de Chromium en `%APPDATA%/sistema-recibos/Local Storage/`.

### Rebuild del .exe falla con error de symlinks
```bash
# Limpiar cache de electron-builder y reintentar:
Remove-Item "$env:LOCALAPPDATA\electron-builder\Cache\winCodeSign" -Recurse -Force
npm run build
```
Los errores de symlinks en `darwin/` son irrelevantes (son archivos de macOS, no afectan Windows).

---

## Decisiones Técnicas

### ¿Por qué un solo archivo HTML?
El sistema es relativamente simple (no tiene routing, no tiene API, no tiene base de datos). Mantenerlo en un solo archivo facilita el mantenimiento y la distribución. Vue 3 Composition API permite organizar el código internamente con funciones y refs.

### ¿Por qué localStorage y no SQLite?
- Los datos son pequeños (empleados, empresas, historial de recibos)
- No requiere queries complejas
- localStorage persiste automáticamente en Electron
- No agrega dependencias nativas (SQLite requiere rebuild)

### ¿Por qué Electron y no Tauri/NW.js?
- Electron es el estándar de facto para apps desktop con web tech
- electron-builder tiene soporte maduro para NSIS installers
- Chromium integrado garantiza compatibilidad visual idéntica en todas las PCs

### ¿Por qué Machine ID y no un servidor de licencias?
- El sistema debe ser 100% offline
- No hay internet garantizado en las PCs target
- Machine ID es simple, robusto, y no requiere infraestructura

### ¿Por qué dialog.showMessageBoxSync en vez de confirm()?
Bug conocido de Chromium en Electron: los diálogos nativos del browser (`confirm()`, `alert()`, `prompt()`) roban el foco del renderer y no lo devuelven. La solución oficial es usar los diálogos del módulo `dialog` de Electron.

---

## Contacto

**Desarrollador:** Matias Bourgeois  
**Versión:** 5.0.0 Supreme Edition  
**Última actualización:** Mayo 2026
