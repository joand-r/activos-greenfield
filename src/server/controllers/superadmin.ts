import { pool } from '@/lib/db/database';
import bcrypt from 'bcryptjs';

export const obtenerBitacora = async (req, res) => {
  try {
    const { tabla, accion, usuario_id, limit = 200, offset = 0 } = req.query;

    let query = `
      SELECT 
        ba.id,
        ba.accion,
        ba.tabla_afectada,
        ba.registro_id,
        ba.datos_anteriores,
        ba.datos_nuevos,
        ba.ip_usuario,
        ba.fecha,
        u.nombre  AS usuario_nombre,
        u.email   AS usuario_email,
        u.rol     AS usuario_rol
      FROM bitacora_auditoria ba
      LEFT JOIN usuario u ON ba.usuario_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (tabla) {
      query += ` AND ba.tabla_afectada = $${idx++}`;
      params.push(tabla);
    }
    if (accion) {
      query += ` AND ba.accion = $${idx++}`;
      params.push(accion);
    }
    if (usuario_id) {
      query += ` AND ba.usuario_id = $${idx++}`;
      params.push(Number(usuario_id));
    }

    query += ` ORDER BY ba.fecha DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(Number(limit), Number(offset));

    const result = await pool.query(query, params);

    // Total sin paginación
    let countQuery = `SELECT COUNT(*) FROM bitacora_auditoria WHERE 1=1`;
    const countParams = [];
    let cidx = 1;
    if (tabla)      { countQuery += ` AND tabla_afectada = $${cidx++}`; countParams.push(tabla); }
    if (accion)     { countQuery += ` AND accion = $${cidx++}`;         countParams.push(accion); }
    if (usuario_id) { countQuery += ` AND usuario_id = $${cidx++}`;     countParams.push(Number(usuario_id)); }
    const countResult = await pool.query(countQuery, countParams);

    res.json({
      total: Number(countResult.rows[0].count),
      registros: result.rows,
    });
  } catch (error) {
    console.error('Error al obtener bitácora:', error);
    res.status(500).json({ error: 'Error al obtener bitácora de auditoría' });
  }
};

export const obtenerBitacoraTablas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT tabla_afectada FROM bitacora_auditoria ORDER BY tabla_afectada`
    );
    res.json(result.rows.map(r => r.tabla_afectada));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tablas' });
  }
};

export const obtenerBitacoraStats = async (req, res) => {
  try {
    const [total, porAccion, porTabla, recientes] = await Promise.all([
      pool.query(`SELECT COUNT(*) FROM bitacora_auditoria`),
      pool.query(`SELECT accion, COUNT(*) as total FROM bitacora_auditoria GROUP BY accion ORDER BY total DESC`),
      pool.query(`SELECT tabla_afectada, COUNT(*) as total FROM bitacora_auditoria GROUP BY tabla_afectada ORDER BY total DESC`),
      pool.query(`SELECT COUNT(*) FROM bitacora_auditoria WHERE fecha >= NOW() - INTERVAL '24 hours'`),
    ]);

    res.json({
      total: Number(total.rows[0].count),
      ultimas_24h: Number(recientes.rows[0].count),
      por_accion: porAccion.rows,
      por_tabla: porTabla.rows,
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.nombre, u.email, r.nombre AS rol, u.rol_id, u.created_at 
       FROM usuario u 
       LEFT JOIN roles r ON u.rol_id = r.id 
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const obtenerRoles = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre FROM roles ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener roles:', error);
    res.status(500).json({ error: 'Error al obtener roles' });
  }
};

export const crearUsuario = async (req, res) => {
  try {
    const { nombre, email, password, rol_id } = req.body;
    if (!nombre || !email || !password || !rol_id) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si ya existe el correo
    const exists = await pool.query('SELECT id FROM usuario WHERE email = $1', [email]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuario (nombre, email, password, rol_id) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id, nombre, email, rol_id, created_at`,
      [nombre, email, hashedPassword, Number(rol_id)]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, password, rol_id } = req.body;

    if (!nombre || !email || !rol_id) {
      return res.status(400).json({ error: 'Nombre, email y rol son requeridos' });
    }

    // Verificar si el email ya existe para otro usuario
    const emailCheck = await pool.query(
      'SELECT id FROM usuario WHERE email = $1 AND id <> $2',
      [email, Number(id)]
    );
    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: 'El email ya está registrado por otro usuario' });
    }

    let queryStr;
    let params;

    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      queryStr = `
        UPDATE usuario 
        SET nombre = $1, email = $2, password = $3, rol_id = $4 
        WHERE id = $5 
        RETURNING id, nombre, email, rol_id, created_at
      `;
      params = [nombre, email, hashedPassword, Number(rol_id), Number(id)];
    } else {
      queryStr = `
        UPDATE usuario 
        SET nombre = $1, email = $2, rol_id = $3 
        WHERE id = $4 
        RETURNING id, nombre, email, rol_id, created_at
      `;
      params = [nombre, email, Number(rol_id), Number(id)];
    }

    const result = await pool.query(queryStr, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar que el administrador se elimine a sí mismo
    if (req.userId && Number(id) === Number(req.userId)) {
      return res.status(400).json({ error: 'No puedes eliminar tu propio usuario' });
    }

    const result = await pool.query('DELETE FROM usuario WHERE id = $1 RETURNING id', [Number(id)]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

export const obtenerBackupsInfo = async (req, res) => {
  try {
    const [tables, dbSize] = await Promise.all([
      pool.query(`
        SELECT table_name,
               pg_size_pretty(pg_total_relation_size(quote_ident(table_name))) AS size,
               (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name) AS columnas
        FROM information_schema.tables t
        WHERE table_schema = 'public'
        ORDER BY pg_total_relation_size(quote_ident(table_name)) DESC
      `),
      pool.query(`SELECT pg_size_pretty(pg_database_size(current_database())) AS db_size`),
    ]);

    res.json({
      config: {
        schedule: 'Semanal (Domingo) a las 3:00 AM UTC',
        destino: 'AWS S3 (bucket configurado en GitHub Secrets)',
        formato: 'pg_dump → gzip → cifrado SSE-S3',
        retencion: 'Gestionada por política S3',
      },
      base_de_datos: {
        nombre: process.env.DB_NAME || 'activos_greenfield',
        tamaño_total: dbSize.rows[0]?.db_size || 'N/A',
        tablas: tables.rows,
      },
    });
  } catch (error) {
    console.error('Error al obtener info de backups:', error);
    res.status(500).json({ error: 'Error al obtener información de backups' });
  }
};
