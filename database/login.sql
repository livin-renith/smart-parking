-- 5.Count total users:

SELECT
  COUNT(*) as total_users,
  SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) as admins,
  SUM(CASE WHEN role = 'user'  THEN 1 ELSE 0 END) as regular_users
FROM users;