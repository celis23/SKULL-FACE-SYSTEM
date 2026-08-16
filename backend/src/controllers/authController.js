const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { findUserByUsername, findUserByEmail, createUser } = require('../models/userModel');

async function login(req, res) {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const user = await findUserByUsername(usuario);

    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const passwordValida = await bcrypt.compare(password, user.password);

    if (!passwordValida) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }

    const token = jwt.sign(
      { id: user.id, usuario: user.usuario, rol: user.rol },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    return res.json({
      token,
      user: { id: user.id, usuario: user.usuario, rol: user.rol }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}

async function register(req, res) {
  try {
    const { nombreCompleto, email, telefono, usuario, password } = req.body;
    if (!nombreCompleto || !email || !usuario || !password) {
      return res.status(400).json({ message: 'Nombre completo, email, usuario y contraseña son requeridos' });
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: 'Email inválido' });
    if (password.length < 6) return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres' });
    if (await findUserByUsername(usuario)) return res.status(409).json({ message: 'El usuario ya está registrado' });
    if (await findUserByEmail(email)) return res.status(409).json({ message: 'El email ya está registrado' });
    const user = await createUser({
      usuario,
      password: await bcrypt.hash(password, 10),
      nombreCompleto,
      email,
      telefono,
      rol: 'cliente'
    });
    const token = jwt.sign({ id: user.id, usuario: user.usuario, rol: user.rol }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '8h'
    });
    return res.status(201).json({ token, user: { id: user.id, usuario: user.usuario, rol: user.rol } });
  } catch (error) {
    console.error('Error en registro:', error);
    return res.status(500).json({ message: 'No se pudo registrar el cliente' });
  }
}

async function me(req, res) {
  return res.json({ user: req.user });
}

module.exports = { login, register, me };
