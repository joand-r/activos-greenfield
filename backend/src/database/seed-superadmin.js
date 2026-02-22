/**
 * Script para crear el usuario superadmin
 * Ejecutar una sola vez: node backend/src/database/seed-superadmin.js
 *
 * Requiere que .env esté configurado con DATABASE_URL o las variables DB_*.
 */

import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

const SUPERADMIN_EMAIL = 'joandanielrr0@gmail.com';
const SUPERADMIN_NOMBRE = 'Joan Daniel (Owner)';
// Cambia esta contraseña antes de ejecutar el script
const SUPERADMIN_PASSWORD = process.env.SUPERADMIN_PASSWORD || 'Creed9775';

async function seedSuperAdmin() {
  try {
    console.log('🔍 Verificando si el superadmin ya existe...');

    const existing = await pool.query(
      'SELECT id, email, rol FROM usuario WHERE email = $1',
      [SUPERADMIN_EMAIL]
    );

    if (existing.rows.length > 0) {
      const user = existing.rows[0];
      if (user.rol !== 'superadmin') {
        // Actualizar a superadmin si existe pero con otro rol
        await pool.query(
          'UPDATE usuario SET rol = $1 WHERE email = $2',
          ['superadmin', SUPERADMIN_EMAIL]
        );
        console.log(`✅ Usuario ${SUPERADMIN_EMAIL} actualizado a rol "superadmin".`);
      } else {
        console.log(`ℹ️  El usuario ${SUPERADMIN_EMAIL} ya existe con rol "superadmin". No se realizaron cambios.`);
      }
    } else {
      const hashedPassword = await bcrypt.hash(SUPERADMIN_PASSWORD, 10);

      const result = await pool.query(
        `INSERT INTO usuario (nombre, email, password, rol)
         VALUES ($1, $2, $3, $4)
         RETURNING id, nombre, email, rol`,
        [SUPERADMIN_NOMBRE, SUPERADMIN_EMAIL, hashedPassword, 'superadmin']
      );

      console.log('✅ Superadmin creado:', result.rows[0]);
      console.log(`🔑 Contraseña: ${SUPERADMIN_PASSWORD}`);
      console.log('⚠️  Guarda esta contraseña en un lugar seguro. No se mostrará de nuevo.');
    }
  } catch (error) {
    console.error('❌ Error al crear superadmin:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log('🔌 Conexión cerrada.');
  }
}

seedSuperAdmin();
