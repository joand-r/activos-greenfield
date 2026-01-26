import { pool } from './database.js';

const createFunctions = async () => {
  try {
    console.log('📝 Creando función generar_codigo_articulo...');
    
    await pool.query(`
      CREATE OR REPLACE FUNCTION generar_codigo_articulo(p_lugar_id INTEGER)
      RETURNS VARCHAR(50) AS $$
      DECLARE
          v_iniciales VARCHAR(10);
          v_ultimo_numero INTEGER;
          v_nuevo_codigo VARCHAR(50);
      BEGIN
          -- Obtener las iniciales del lugar
          SELECT iniciales INTO v_iniciales
          FROM lugar
          WHERE id = p_lugar_id;
          
          IF v_iniciales IS NULL THEN
              RAISE EXCEPTION 'Lugar no encontrado con ID: %', p_lugar_id;
          END IF;
          
          -- Obtener el último número usado para este lugar
          SELECT COALESCE(MAX(
              CAST(
                  SUBSTRING(codigo FROM LENGTH(v_iniciales) + 2)
                  AS INTEGER
              )
          ), 0) INTO v_ultimo_numero
          FROM articulo
          WHERE codigo LIKE v_iniciales || '-%';
          
          -- Generar el nuevo código
          v_nuevo_codigo := v_iniciales || '-' || LPAD((v_ultimo_numero + 1)::TEXT, 3, '0');
          
          RETURN v_nuevo_codigo;
      END;
      $$ LANGUAGE plpgsql;
    `);
    
    console.log('✅ Función creada exitosamente');
    
    // Probar la función
    const test = await pool.query('SELECT generar_codigo_articulo(1) as codigo');
    console.log('🧪 Código de prueba generado:', test.rows[0].codigo);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createFunctions();
