export async function up(client) {
  // 1. Crear tabla roles
  await client.query(`
    CREATE TABLE IF NOT EXISTS roles (
      id BIGSERIAL PRIMARY KEY,
      nombre VARCHAR(50) UNIQUE NOT NULL
    );
  `);

  // 2. Insertar roles predeterminados
  await client.query(`
    INSERT INTO roles (nombre) VALUES ('Administrador') ON CONFLICT DO NOTHING;
    INSERT INTO roles (nombre) VALUES ('Operadora') ON CONFLICT DO NOTHING;
  `);

  // 3. Agregar columna rol_id a usuario
  await client.query(`
    ALTER TABLE usuario ADD COLUMN IF NOT EXISTS rol_id BIGINT REFERENCES roles(id) ON DELETE RESTRICT;
  `);

  // 4. Mapear usuarios existentes a sus nuevos roles
  const usersRes = await client.query('SELECT id, email, rol FROM usuario');
  const rolesRes = await client.query('SELECT id, nombre FROM roles');
  
  const rolesMap = {};
  rolesRes.rows.forEach(r => {
    rolesMap[r.nombre] = r.id;
  });

  for (const u of usersRes.rows) {
    let newRolName = 'Operadora'; // Valor por defecto
    // Si era admin/superadmin o el correo del creador, es Administrador
    if (u.rol === 'superadmin' || u.rol === 'admin' || u.email === 'joandanielrr0@gmail.com') {
      newRolName = 'Administrador';
    }
    const rolId = rolesMap[newRolName];
    await client.query('UPDATE usuario SET rol_id = $1 WHERE id = $2', [rolId, u.id]);
  }

  // 5. Eliminar la columna rol antigua y su check
  await client.query(`
    ALTER TABLE usuario DROP CONSTRAINT IF EXISTS usuario_rol_check;
  `);
  await client.query(`
    ALTER TABLE usuario DROP COLUMN IF EXISTS rol;
  `);

  // 6. Crear usuario de prueba Operadora si no existe
  const opCheck = await client.query("SELECT id FROM usuario WHERE email = 'operadora@greenfield.com.bo'");
  if (opCheck.rows.length === 0) {
    const bcryptModule = await import('bcryptjs');
    const bcrypt = bcryptModule.default || bcryptModule;
    const hashedPassword = await bcrypt.hash('Operadora123.', 10);
    const opRolId = rolesMap['Operadora'];
    await client.query(`
      INSERT INTO usuario (email, password, nombre, rol_id)
      VALUES ('operadora@greenfield.com.bo', $1, 'Operadora de Prueba', $2)
    `, [hashedPassword, opRolId]);
  }
}

export async function down(client) {
  // 1. Agregar columna rol antigua
  await client.query(`
    ALTER TABLE usuario ADD COLUMN IF NOT EXISTS rol VARCHAR(50);
  `);

  // 2. Mapear de vuelta los roles a la columna textual rol
  const usersRes = await client.query(`
    SELECT u.id, r.nombre AS rol_nombre 
    FROM usuario u 
    LEFT JOIN roles r ON u.rol_id = r.id
  `);

  for (const u of usersRes.rows) {
    let oldRol = 'usuario';
    if (u.rol_nombre === 'Administrador') {
      oldRol = 'superadmin';
    } else if (u.rol_nombre === 'Operadora') {
      oldRol = 'admin';
    }
    await client.query('UPDATE usuario SET rol = $1 WHERE id = $2', [oldRol, u.id]);
  }

  // 3. Reestablecer el check constraint anterior
  await client.query(`
    ALTER TABLE usuario
      ADD CONSTRAINT usuario_rol_check
      CHECK (rol IN ('admin', 'usuario', 'superadmin'));
  `);

  // 4. Eliminar columna rol_id
  await client.query(`
    ALTER TABLE usuario DROP COLUMN IF EXISTS rol_id;
  `);

  // 5. Eliminar tabla roles
  await client.query(`
    DROP TABLE IF EXISTS roles CASCADE;
  `);
}
