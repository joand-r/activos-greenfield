import { Router } from 'express';
import { pool } from '../config/database.js';
import { authenticateToken, verifySuperAdmin } from '../middlewares/auth.middleware.js';

const router = Router();

// Todas las rutas requieren estar autenticado y tener rol superadmin
router.use(authenticateToken, verifySuperAdmin);

// ─────────────────────────────────────────────────────────────
// GET /api/superadmin/bitacora
// Retorna el historial completo de auditoría con filtros opcionales
// ─────────────────────────────────────────────────────────────
router.get('/bitacora', async (req, res) => {
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
});

// ─────────────────────────────────────────────────────────────
// GET /api/superadmin/bitacora/tablas
// Retorna las tablas únicas registradas en la bitácora (para filtros)
// ─────────────────────────────────────────────────────────────
router.get('/bitacora/tablas', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT tabla_afectada FROM bitacora_auditoria ORDER BY tabla_afectada`
    );
    res.json(result.rows.map(r => r.tabla_afectada));
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener tablas' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/superadmin/bitacora/stats
// Resumen estadístico de auditoría
// ─────────────────────────────────────────────────────────────
router.get('/bitacora/stats', async (req, res) => {
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
});

// ─────────────────────────────────────────────────────────────
// GET /api/superadmin/usuarios
// Lista todos los usuarios del sistema
// ─────────────────────────────────────────────────────────────
router.get('/usuarios', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, nombre, email, rol, created_at FROM usuario ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

// ─────────────────────────────────────────────────────────────
// GET /api/superadmin/backups/info
// Información sobre la configuración de backups
// ─────────────────────────────────────────────────────────────
router.get('/backups/info', async (req, res) => {
  try {
    // Estadísticas de la BD como referencia del estado actual
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
        schedule: 'Diario a las 3:00 AM UTC',
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
});

export default router;
