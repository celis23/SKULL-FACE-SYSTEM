const bcrypt = require('bcrypt');
const userModel = require('../models/userModel');

const ROLES_ADMINISTRABLES = ['administrador', 'recepcionista'];

function publicUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function validateUser(body, isUpdate = false) {
  const { usuario, password, rol } = body;
  if (!usuario || !rol || (!isUpdate && !password)) return 'Usuario, contraseña y rol son requeridos';
  if (!ROLES_ADMINISTRABLES.includes(rol)) return 'Solo se pueden asignar roles de administrador o recepcionista';
  if (password && password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
  return null;
}

async function getUsers(req, res) {
  try { return res.json(await userModel.getUsers()); }
  catch (error) { console.error('Error al obtener usuarios:', error); return res.status(500).json({ message: 'Error al obtener usuarios' }); }
}

async function createUser(req, res) {
  try {
    const validation = validateUser(req.body);
    if (validation) return res.status(400).json({ message: validation });
    if (await userModel.findUserByUsername(req.body.usuario)) return res.status(409).json({ message: 'El usuario ya existe' });
    if (req.body.email && await userModel.findUserByEmail(req.body.email)) return res.status(409).json({ message: 'El email ya existe' });
    const user = await userModel.createUser({ ...req.body, password: await bcrypt.hash(req.body.password, 10) });
    return res.status(201).json(publicUser(user));
  } catch (error) { console.error('Error al crear usuario:', error); return res.status(500).json({ message: 'Error al crear usuario' }); }
}

async function updateUser(req, res) {
  try {
    const existing = await userModel.getUserById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Usuario no encontrado' });
    const validation = validateUser(req.body, true);
    if (validation) return res.status(400).json({ message: validation });
    if (existing.rol === 'cliente') return res.status(400).json({ message: 'Los clientes solo se gestionan desde su registro' });
    const byUsername = await userModel.findUserByUsername(req.body.usuario);
    if (byUsername && byUsername.id !== existing.id) return res.status(409).json({ message: 'El usuario ya existe' });
    const byEmail = req.body.email ? await userModel.findUserByEmail(req.body.email) : null;
    if (byEmail && byEmail.id !== existing.id) return res.status(409).json({ message: 'El email ya existe' });
    const password = req.body.password ? await bcrypt.hash(req.body.password, 10) : null;
    const user = await userModel.updateUser(req.params.id, { ...req.body, password });
    return res.json(publicUser(user));
  } catch (error) { console.error('Error al actualizar usuario:', error); return res.status(500).json({ message: 'Error al actualizar usuario' }); }
}

async function deleteUser(req, res) {
  try {
    if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
    const user = await userModel.getUserById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    await userModel.deleteUser(req.params.id);
    return res.json({ message: 'Usuario eliminado correctamente' });
  } catch (error) { console.error('Error al eliminar usuario:', error); return res.status(500).json({ message: 'No se pudo eliminar el usuario' }); }
}

module.exports = { getUsers, createUser, updateUser, deleteUser };
