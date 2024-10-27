const express = require('express');
const Registro = require('../models/registro');
const moment = require('moment-timezone');
const geolib = require('geolib'); // Asegúrate de haber instalado geolib
const router = express.Router();

// Define las ubicaciones permitidas
const ubicacionesPermitidas = [
    { latitude: 4.452138273023352, longitude: -75.1308883161288 } // Ubicación permitida
];

// Función para verificar si la ubicación está permitida
const estaUbicacionPermitida = (ubicacion) => {
    const { latitude, longitude } = ubicacion;

    // Comprueba si está dentro de un radio de 100 metros (puedes ajustar este valor)
    return ubicacionesPermitidas.some(ubicacionPermitida =>
        geolib.isPointWithinRadius(
            { latitude, longitude },
            ubicacionPermitida,
            100 // Radio en metros
        )
    );
};

// Ruta para registrar entrada
router.post('/entrada', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    // Verifica si la ubicación fue proporcionada
    if (!ubicacion || !ubicacion.latitude || !ubicacion.longitude) {
        return res.status(400).json({ msg: 'Ubicación no válida. Por favor, habilita la geolocalización.' });
    }

    if (!estaUbicacionPermitida(ubicacion)) {
        return res.status(400).json({ msg: 'Debes dirigirte a la ubicación permitida: 4.452138273023352, -75.1308883161288' });
    }

    try {
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

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

// Ruta para registrar salida
router.post('/salida', async (req, res) => {
    const { userId, deviceID, ubicacion } = req.body;

    // Verifica si la ubicación fue proporcionada
    if (!ubicacion || !ubicacion.latitude || !ubicacion.longitude) {
        return res.status(400).json({ msg: 'Ubicación no válida. Por favor, habilita la geolocalización.' });
    }

    if (!estaUbicacionPermitida(ubicacion)) {
        return res.status(400).json({ msg: 'Debes dirigirte a la ubicación permitida: 4.452138273023352, -75.1308883161288' });
    }

    try {
        let fechaLocal = moment.tz("America/Bogota").subtract(5, 'hours');

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
