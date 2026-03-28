INSERT INTO users (name, email, phone, password_hash, role, access_token)
VALUES ('Владелец', 'owner@masterpytey.ru', '+70000000000', 'owner123', 'owner', 'owner123')
ON CONFLICT DO NOTHING;

INSERT INTO sites (name, description, owner_id, is_active)
SELECT 'Главный Портал', 'Основная платформа Мастер путей', id, true
FROM users WHERE role = 'owner' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO quests (site_id, title, description, is_active, order_index)
SELECT s.id, 'Путь Искателя', 'Первый квест для начинающих путников. Раскройте тайны древнего замка.', true, 0
FROM sites s LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO levels (quest_id, title, riddle_type, riddle_content, answer, hint, order_index)
SELECT q.id, 'Врата Начала', 'text', 'Я есть у каждого, но нельзя потрогать. Меня можно потерять, но нельзя найти на земле. Что это?', 'имя', 'Родители дают это при рождении', 0
FROM quests q LIMIT 1;

INSERT INTO levels (quest_id, title, riddle_type, riddle_content, answer, hint, order_index)
SELECT q.id, 'Тёмный коридор', 'text', 'Чем больше берёшь — тем больше становится. Что это?', 'яма', 'Подумай о земле', 1
FROM quests q LIMIT 1;
