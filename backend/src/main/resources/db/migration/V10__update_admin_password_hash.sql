-- ============================================================
-- V10 — Correção do Hash BCrypt do Usuário Administrador
-- ============================================================
UPDATE users
SET password = '$2a$12$fx3E1ky2LW3NCs3EqoUeKeqiba2hjeGQ.Kev0khO5B6ySBxkLXQl6'
WHERE email = 'admin@crmscanner.com';
