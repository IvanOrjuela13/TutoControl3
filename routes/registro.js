const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const router = express.Router();

// Nueva ubicación permitida
const ubicacionPermitida = {
    latitude: 4.450243,
    longitude: -75.177566
};

// Función para calcular la distancia entre dos puntos geográficos en metros usando la fórmula de Haversine
function calcularDistancia(ubicacion1, ubicacion2) {
    const R = 6371e3; // Radio de la Tierra en metros
    const lat1 = ubicacion1.latitude * Math.PI / 180;
    const lat2 = ubicacion2.latitude * Math.PI / 180;
    const deltaLat = (ubicacion2.latitude - ubicacion1.latitude) * Math.PI / 180;
    const deltaLon = (ubicacion2.longitude - ubicacion1.longitude) * Math.PI / 180;

    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
}

// Verifica si el usuario está dentro de un radio permitido
function estaUbicacionPermitida(ubicacion) {
    const distancia = calcularDistancia(ubicacion, ubicacionPermitida);
    return distancia <= 100; // Radio de 100 metros
}

// Ruta para registrar la entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    // Verifica si la ubicación fue proporcionada
    if (!ubicacion || !ubicacion.latitude || !ubicacion.longitude) {
        return res.status(400).json({ msg: 'Ubicación no válida. Por favor, habilita la geolocalización.' });
    }

    if (!estaUbicacionPermitida(ubicacion)) {
        return res.status(400).json({ msg: 'Debes dirigirte a la ubicación permitida: 4.450243, -75.177566' });
    }

    try {
        const fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(),
            tipo: 'entrada'
        });
        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Entrada registrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la entrada' });
    }
});

// Ruta para registrar la salida
router.post('/salida', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    // Verifica si la ubicación fue proporcionada
    if (!ubicacion || !ubicacion.latitude || !ubicacion.longitude) {
        return res.status(400).json({ msg: 'Ubicación no válida. Por favor, habilita la geolocalización.' });
    }

    if (!estaUbicacionPermitida(ubicacion)) {
        return res.status(400).json({ msg: 'Debes dirigirte a la ubicación permitida: 4.450243, -75.177566' });
    }

    try {
        const fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

        const nuevoRegistro = new Registro({
            userId,
            deviceID,
            ubicacion,
            fecha: fechaLocal.toDate(),
            tipo: 'salida'
        });
        await nuevoRegistro.save();
        res.status(201).json({ msg: 'Salida registrada exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: 'Error al registrar la salida' });
    }
});

module.exports = router;
