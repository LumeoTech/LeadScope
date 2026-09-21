-- ============================================================
-- V16 — Definir Gabriel Castro como Admin Master do Sistema
-- ============================================================

DO $$
DECLARE
    v_admin_role_id BIGINT;
    v_user_id BIGINT;
BEGIN
    -- 1. Garante que a role ADMIN existe
    SELECT id INTO v_admin_role_id FROM roles WHERE name = 'ADMIN';
    IF v_admin_role_id IS NULL THEN
        INSERT INTO roles (name, description) VALUES ('ADMIN', 'Administrador do sistema — acesso total') RETURNING id INTO v_admin_role_id;
    END IF;

    -- 2. Verifica se Gabriel Castro já existe por nome ou email
    SELECT id INTO v_user_id 
    FROM users 
    WHERE LOWER(name) LIKE '%gabriel castro%' 
       OR LOWER(email) LIKE '%gabriel%castro%' 
       OR LOWER(email) = 'gabriel@leadscope.com'
    LIMIT 1;

    IF v_user_id IS NOT NULL THEN
        -- Atualiza para ADMIN master com acesso irrestrito
        UPDATE users 
        SET role_id = v_admin_role_id,
            name = 'Gabriel Castro',
            active = TRUE,
            status = 'ACTIVE',
            updated_at = NOW()
        WHERE id = v_user_id;
    ELSE
        -- Cria o usuário Gabriel Castro como Admin Master
        INSERT INTO users (name, email, password, active, role_id, status, created_at, updated_at)
        VALUES (
            'Gabriel Castro',
            'gabriel@leadscope.com',
            '$2a$12$KIXjJXvFCe9lLoGPYYnFmOWJLNEMJL6EFw3Bq4EWxA7cIGwF4qbG',
            TRUE,
            v_admin_role_id,
            'ACTIVE',
            NOW(),
            NOW()
        );
    END IF;

    -- 3. Se existir tabela profiles no schema public (Supabase)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        BEGIN
            UPDATE public.profiles 
            SET role = 'admin' 
            WHERE LOWER(full_name) LIKE '%gabriel castro%' 
               OR LOWER(email) LIKE '%gabriel%';
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END IF;
    END IF;

    -- 4. Se existir tabela user_roles no schema public (Supabase)
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_roles') THEN
        BEGIN
            UPDATE public.user_roles
            SET role = 'admin'
            WHERE user_id = v_user_id;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END IF;
    END IF;
END $$;
