export async function up(client) {
  // 1. Reemplazar la función de generación automática de códigos para usar LPAD a 5 dígitos
  await client.query(`
    CREATE OR REPLACE FUNCTION generar_codigo_activo(p_lugar_id BIGINT)
    RETURNS VARCHAR(100) AS $$
    DECLARE
        v_inicial VARCHAR(10);
        v_ultimo_numero INTEGER;
        v_nuevo_codigo VARCHAR(100);
    BEGIN
        SELECT inicial INTO v_inicial
        FROM lugar
        WHERE id = p_lugar_id;
        
        IF v_inicial IS NULL THEN
            RAISE EXCEPTION 'Lugar no encontrado con ID: %', p_lugar_id;
        END IF;
        
        SELECT COALESCE(MAX(
            CAST(
                SUBSTRING(codigo FROM LENGTH(v_inicial) + 2)
                AS INTEGER
            )
        ), 0) INTO v_ultimo_numero
        FROM activo
        WHERE codigo LIKE v_inicial || '-%';
        
        v_nuevo_codigo := v_inicial || '-' || LPAD((v_ultimo_numero + 1)::TEXT, 5, '0');
        
        RETURN v_nuevo_codigo;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 2. Actualizar los códigos de activos existentes a 5 dígitos de relleno con ceros
  await client.query(`
    UPDATE activo
    SET codigo = SPLIT_PART(codigo, '-', 1) || '-' || LPAD(SPLIT_PART(codigo, '-', 2), 5, '0')
    WHERE codigo LIKE '%-%';
  `);
}

export async function down(client) {
  // 1. Revertir la función de generación a 3 dígitos
  await client.query(`
    CREATE OR REPLACE FUNCTION generar_codigo_activo(p_lugar_id BIGINT)
    RETURNS VARCHAR(100) AS $$
    DECLARE
        v_inicial VARCHAR(10);
        v_ultimo_numero INTEGER;
        v_nuevo_codigo VARCHAR(100);
    BEGIN
        SELECT inicial INTO v_inicial
        FROM lugar
        WHERE id = p_lugar_id;
        
        IF v_inicial IS NULL THEN
            RAISE EXCEPTION 'Lugar no encontrado con ID: %', p_lugar_id;
        END IF;
        
        SELECT COALESCE(MAX(
            CAST(
                SUBSTRING(codigo FROM LENGTH(v_inicial) + 2)
                AS INTEGER
            )
        ), 0) INTO v_ultimo_numero
        FROM activo
        WHERE codigo LIKE v_inicial || '-%';
        
        v_nuevo_codigo := v_inicial || '-' || LPAD((v_ultimo_numero + 1)::TEXT, 3, '0');
        
        RETURN v_nuevo_codigo;
    END;
    $$ LANGUAGE plpgsql;
  `);

  // 2. Revertir los códigos existentes a 3 dígitos de relleno con ceros
  await client.query(`
    UPDATE activo
    SET codigo = SPLIT_PART(codigo, '-', 1) || '-' || LPAD(SPLIT_PART(codigo, '-', 2), 3, '0')
    WHERE codigo LIKE '%-%';
  `);
}
