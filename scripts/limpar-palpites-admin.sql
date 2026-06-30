DELETE FROM palpites
WHERE "usuarioId" IN (SELECT id FROM users WHERE role = 'ADMIN');

DELETE FROM palpites_mata_mata
WHERE "usuarioId" IN (SELECT id FROM users WHERE role = 'ADMIN');
