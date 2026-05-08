/**
 * license.js — Sistema de Licenciamiento por Machine ID + 1 Año
 * Sistema de Recibos v5.0 Supreme Edition
 * 
 * Seguridad: AES-256-CBC con key derivada del Machine ID + salt
 * Validación: Machine ID match + fecha de expiración (365 días)
 */

const crypto = require('crypto');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// ══════ CONSTANTS ══════
const LICENSE_FILENAME = '.license';
const LICENSE_DURATION_DAYS = 365;
const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
const SALT = 'SistemaRecibos_Supreme_2026_Salt_Key'; // Ofuscado en producción

// ══════ MACHINE ID ══════

/**
 * Genera un ID único basado en el hardware de la máquina.
 * Combina: CPU model + hostname + username + total memory + platform
 * Produce un hash SHA-256 estable que identifica la máquina.
 */
function getMachineId() {
    const cpus = os.cpus();
    const cpuModel = cpus.length > 0 ? cpus[0].model : 'unknown';
    const hostname = os.hostname();
    const username = os.userInfo().username;
    const totalMem = os.totalmem().toString();
    const platform = os.platform() + os.arch();
    
    // Obtener MACs de interfaces de red (solo físicas, no virtuales)
    const nets = os.networkInterfaces();
    const macs = [];
    for (const name of Object.keys(nets)) {
        for (const iface of nets[name]) {
            if (!iface.internal && iface.mac && iface.mac !== '00:00:00:00:00:00') {
                macs.push(iface.mac);
            }
        }
    }
    const macString = macs.sort().join('|');
    
    const raw = `${cpuModel}::${hostname}::${username}::${totalMem}::${platform}::${macString}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
}

// ══════ ENCRYPTION ══════

function deriveKey(machineId) {
    return crypto.createHash('sha256').update(machineId + SALT).digest();
}

function encrypt(data, machineId) {
    const key = deriveKey(machineId);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ENCRYPTION_ALGORITHM, key, iv);
    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedData, machineId) {
    try {
        const key = deriveKey(machineId);
        const parts = encryptedData.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const decipher = crypto.createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return JSON.parse(decrypted);
    } catch (e) {
        return null;
    }
}

// ══════ LICENSE FILE PATH ══════

function getLicensePath() {
    const userDataPath = app.getPath('userData');
    return path.join(userDataPath, LICENSE_FILENAME);
}

// ══════ LICENSE OPERATIONS ══════

/**
 * Genera y guarda una nueva licencia para esta máquina.
 * Se activa automáticamente al primer uso.
 */
function generateLicense() {
    const machineId = getMachineId();
    const now = new Date();
    const expiry = new Date(now.getTime() + LICENSE_DURATION_DAYS * 24 * 60 * 60 * 1000);
    
    const licenseData = {
        machineId: machineId,
        activationDate: now.toISOString(),
        expiryDate: expiry.toISOString(),
        version: '5.0.0',
        product: 'Sistema de Recibos Supreme',
        owner: os.userInfo().username + '@' + os.hostname()
    };
    
    const encrypted = encrypt(licenseData, machineId);
    const licensePath = getLicensePath();
    
    // Asegurar que el directorio existe
    const dir = path.dirname(licensePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(licensePath, encrypted, 'utf8');
    return licenseData;
}

/**
 * Valida la licencia existente.
 * Retorna: { valid, reason, data }
 */
function validateLicense() {
    const licensePath = getLicensePath();
    const machineId = getMachineId();
    
    // 1. Verificar si existe el archivo
    if (!fs.existsSync(licensePath)) {
        return { valid: false, reason: 'NO_LICENSE', data: null };
    }
    
    // 2. Leer y desencriptar
    const encryptedData = fs.readFileSync(licensePath, 'utf8');
    const licenseData = decrypt(encryptedData, machineId);
    
    if (!licenseData) {
        return { valid: false, reason: 'INVALID_MACHINE', data: null };
    }
    
    // 3. Verificar Machine ID
    if (licenseData.machineId !== machineId) {
        return { valid: false, reason: 'MACHINE_MISMATCH', data: null };
    }
    
    // 4. Verificar expiración
    const now = new Date();
    const expiry = new Date(licenseData.expiryDate);
    
    if (now > expiry) {
        return { valid: false, reason: 'EXPIRED', data: licenseData };
    }
    
    // 5. Todo OK
    return { valid: true, reason: 'VALID', data: licenseData };
}

/**
 * Obtiene información de la licencia actual.
 */
function getLicenseInfo() {
    const validation = validateLicense();
    
    if (!validation.data) {
        return {
            valid: false,
            reason: validation.reason,
            daysRemaining: 0,
            activationDate: null,
            expiryDate: null,
            machineId: getMachineId(),
            owner: null
        };
    }
    
    const now = new Date();
    const expiry = new Date(validation.data.expiryDate);
    const daysRemaining = Math.max(0, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
    
    return {
        valid: validation.valid,
        reason: validation.reason,
        daysRemaining: daysRemaining,
        activationDate: validation.data.activationDate,
        expiryDate: validation.data.expiryDate,
        machineId: validation.data.machineId,
        owner: validation.data.owner,
        version: validation.data.version
    };
}

/**
 * Activa la licencia automáticamente.
 * Si ya existe una licencia válida, no hace nada.
 * Si no existe, genera una nueva.
 */
function autoActivate() {
    const validation = validateLicense();
    
    if (validation.valid) {
        return { activated: false, message: 'Licencia ya activa', data: getLicenseInfo() };
    }
    
    if (validation.reason === 'NO_LICENSE') {
        const data = generateLicense();
        return { activated: true, message: 'Licencia activada exitosamente', data: getLicenseInfo() };
    }
    
    // Si está expirada o es de otra máquina, no reactivar
    return { activated: false, message: validation.reason, data: getLicenseInfo() };
}

/**
 * Renueva la licencia usando un código generado por el admin.
 * El código contiene: Machine ID + nueva fecha de expiración + firma.
 * @param {string} code - Código de renovación en base64
 * @returns {{ success, message, data }}
 */
function renewWithCode(code) {
    try {
        const machineId = getMachineId();
        
        // 1. Decodificar el código
        const decoded = JSON.parse(Buffer.from(code, 'base64').toString('utf8'));
        const payload = JSON.parse(Buffer.from(decoded.p, 'base64').toString('utf8'));
        const signature = decoded.s;
        
        // 2. Verificar firma
        const expectedSig = crypto.createHash('sha256')
            .update(JSON.stringify(payload) + SALT + payload.machineId)
            .digest('hex')
            .substring(0, 16);
        
        if (signature !== expectedSig) {
            return { success: false, message: 'INVALID_CODE', data: null };
        }
        
        // 3. Verificar que el Machine ID coincide
        if (payload.machineId !== machineId) {
            return { success: false, message: 'MACHINE_MISMATCH', data: null };
        }
        
        // 4. Verificar que el código no está expirado (la fecha de expiración debe ser futura)
        const expiry = new Date(payload.expiryDate);
        if (expiry <= new Date()) {
            return { success: false, message: 'CODE_EXPIRED', data: null };
        }
        
        // 5. Crear nueva licencia con los datos del código
        const licenseData = {
            machineId: machineId,
            activationDate: payload.activationDate,
            expiryDate: payload.expiryDate,
            version: payload.version || '5.0.0',
            product: 'Sistema de Recibos Supreme',
            owner: os.userInfo().username + '@' + os.hostname(),
            renewedAt: new Date().toISOString(),
            type: 'RENEWAL'
        };
        
        const encrypted = encrypt(licenseData, machineId);
        const licensePath = getLicensePath();
        
        const dir = path.dirname(licensePath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(licensePath, encrypted, 'utf8');
        
        return { success: true, message: 'Licencia renovada exitosamente', data: getLicenseInfo() };
    } catch (e) {
        console.error('License renewal error:', e);
        return { success: false, message: 'INVALID_CODE', data: null };
    }
}

module.exports = {
    getMachineId,
    generateLicense,
    validateLicense,
    getLicenseInfo,
    autoActivate,
    renewWithCode,
    LICENSE_DURATION_DAYS
};
