# 📋 Guía de Usuario — Sistema de Recibos v5.0

> Manual completo para el uso diario del sistema de generación de recibos de haberes.

---

## 📥 Instalación

1. Doble click en `Sistema de Recibos Setup 5.0.0.exe`
2. Elegir carpeta de instalación (dejar la predeterminada está bien)
3. Click en "Instalar"
4. Se crea un acceso directo en el Escritorio y en el Menú Inicio
5. La licencia se activa automáticamente (365 días)

> **No necesita internet para funcionar.**

---

## 🏢 Primer Uso — Configurar Empresa

Al abrir por primera vez, el sistema está vacío. Hay que cargar la empresa:

1. Click en el ícono de **engranaje** (⚙️) en la barra superior del sidebar
2. Se abre el modal "Gestión de Empresas"
3. Completar:
   - **Razón Social** (obligatorio) — Ej: `MI EMPRESA S.R.L.`
   - **CUIT** — Ej: `30-71234567-5`
   - **Domicilio** — Ej: `AV. COLÓN 1234`
   - **Lugar de Pago** — Ej: `CÓRDOBA`
4. Click "Guardar"
5. La empresa aparece en el selector desplegable del sidebar

> Se pueden cargar **múltiples empresas** y cambiar entre ellas con el selector.

---

## 👤 Cargar Empleados

1. Click en **"+ NUEVO EMPLEADO"** en el sidebar
2. Completar los datos:
   - **Nombre** (obligatorio) — Ej: `GARCÍA JUAN CARLOS`
   - **CUIL** — Ej: `20-12345678-9`
   - **Legajo** — Ej: `001`
   - **Fecha de Ingreso** — Ej: `01/03/2020`
   - **Antigüedad** (años)
   - **Categoría** — Ej: `ADMINISTRATIVO`
3. Click "Guardar"
4. El empleado queda asociado a la empresa seleccionada

---

## 📝 Generar un Recibo

### Paso 1: Seleccionar empleado
- Usar el buscador **"BUSCAR EMPLEADO..."** en el sidebar
- Escribir parte del nombre → aparece la lista → click para seleccionar

### Paso 2: Configurar período
- Seleccionar **mes** y **año** en los selectores superiores
- Opcionalmente completar **"Fecha pago"**

### Paso 3: Cargar conceptos
- **+ REM** → Concepto remunerativo (suma al bruto)
- **+ NO REM** → Concepto no remunerativo (suma al neto pero no al bruto)
- **+ DED** → Deducción (resta del neto)

Para cada concepto:
1. Escribir la **cantidad** (1 por defecto)
2. Escribir la **descripción** (ej: `SUELDO BÁSICO`)
3. Escribir el **monto** en pesos

### Paso 4: Calcular deducciones automáticas
- Click en **"CALCULAR DEDUCCIONES"** (botón cyan grande)
- El sistema calcula automáticamente: Jubilación, Ley 19032, Obra Social, Cuota Sindical, Seguro de Sepelio, Cuota de Afiliación
- Los porcentajes se configuran en ⚙️ Configuración

### Paso 5: Verificar
- El **Neto a Percibir** se muestra abajo a la izquierda
- La **vista previa** del recibo se muestra a la derecha (Duplicado + Original)

---

## 💾 Guardar e Imprimir

### Guardar recibo
- Click en **"Guardar"** → Se guarda en el historial local
- Aparece un toast verde de confirmación

### Imprimir
- Click en **"Imprimir"** → Se genera un PDF y se abre
- En Electron: usa el sistema nativo de PDF
- En navegador: usa la función de impresión del browser

### Historial
- Click en **"Historial"** → Ver todos los recibos guardados
- Se puede **cargar** un recibo anterior (para reimprimir o editar)
- Se puede **eliminar** un recibo del historial

---

## 📚 Biblioteca de Conceptos

Para no escribir los mismos conceptos cada vez:

1. Click en **"BIBLIOTECA"** (al lado de "Conceptos")
2. Cargar conceptos frecuentes con código, descripción, tipo y monto
3. Al crear un recibo, buscar desde la biblioteca para autocompletar

---

## ⚙️ Configuración de Deducciones

1. Click en el ícono de **nota/regla** (📋) en la barra superior
2. Configurar los porcentajes de cada deducción:
   - Jubilación (default: 11%)
   - Ley 19032 (default: 3%)
   - Obra Social (default: 3%)
   - Cuota Sindical (default: 3%)
   - Seguro de Sepelio (default: 1.5%)
   - Cuota de Afiliación (default: 2%, sobre sueldo básico)
3. Se pueden agregar o quitar deducciones personalizadas

---

## 🔄 Backup y Restauración

### Exportar backup
- Click en **"BACKUP"** (parte inferior del sidebar)
- Se descarga un archivo `.json` con todos los datos
- **Guardar en lugar seguro** (pendrive, nube, etc.)

### Restaurar backup
- Click en **"RESTAURAR"**
- Seleccionar el archivo `.json`
- Confirmar → Los datos se reemplazan → La app se recarga

> ⚠️ **Restaurar reemplaza TODOS los datos actuales.** Hacer backup antes de restaurar.

---

## 🧹 Botones del Empleado

Cuando hay un empleado seleccionado, aparecen estos botones:

| Ícono | Acción |
|-------|--------|
| ✏️ (lápiz) | Editar datos del empleado |
| 🗑️ (papelera) | Eliminar empleado permanentemente |
| 🧹 (borrador) | Limpiar pantalla — deselecciona el empleado y borra los conceptos cargados. No borra al empleado de la base |

---

## 🔍 Zoom

Controles en la esquina inferior derecha:

| Botón | Acción |
|-------|--------|
| **-** | Reducir zoom 10% |
| **%** (gris) | Auto-fit activo — el recibo se ajusta al tamaño de la pantalla |
| **%** (cyan) | Zoom manual — click para volver a auto-fit |
| **+** | Aumentar zoom 10% |

---

## 🌙 Modo Oscuro / Claro

- Click en el ícono de **luna/sol** (🌙) en la barra superior
- Alterna entre Dark Mode y Light Mode
- La preferencia se guarda automáticamente

---

## 🔐 Licencia

### Estado de la licencia
- Se muestra en la parte inferior del sidebar (solo en la app de escritorio)
- **"Licencia Activa — X días restantes"** = todo OK
- Si la licencia expira → aparece un modal bloqueante

### Si la licencia expira

1. Se muestra el modal "Licencia Expirada" con tu **Machine ID**
2. Copiar el Machine ID (texto cyan, seleccionable)
3. Enviarlo al administrador (Matías) por WhatsApp o mail
4. El administrador genera un código de renovación
5. Click en **"Tengo un código de renovación"**
6. Pegar el código → Click **"Renovar Licencia"**
7. Listo — la licencia se renueva ✅

---

## ❓ Preguntas Frecuentes

### ¿Se pierden los datos si desinstalo?
No. Los datos están en `%APPDATA%/sistema-recibos/`. Al reinstalar se mantienen.

### ¿Puedo usar el sistema en otra PC?
Sí, pero necesitás instalar el .exe en esa PC. La licencia se activa automáticamente. Los datos NO se transfieren (hay que usar Backup/Restaurar).

### ¿Funciona sin internet?
Sí, 100%. No necesita internet para nada.

### ¿Cómo hago backup?
Click en "BACKUP" → se descarga un `.json`. Guardarlo en un pendrive o nube.

### ¿Puedo tener múltiples empresas?
Sí. Usar el engranaje ⚙️ para crear empresas y el selector desplegable para cambiar entre ellas.

---

## 🆘 Soporte

**Contacto:** Matías Bourgeois  
**Sistema:** v5.0.0 Supreme Edition  
**Plataforma:** Windows 10/11 x64
