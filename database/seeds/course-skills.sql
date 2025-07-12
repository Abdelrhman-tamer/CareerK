-- Node.js Basics
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT '47543078-98c8-46b5-832c-35cd20711060', id, skill_weight FROM (
  VALUES 
    ('Node.js', 100),
    ('JavaScript', 60)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;

-- Express Framework
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT 'b01e1dd4-bd83-4e17-93e7-5cb81e756082', id, skill_weight FROM (
  VALUES 
    ('Express.js', 100),
    ('Node.js', 60)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;

-- PostgreSQL Essentials
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT '6831b158-d364-431d-8755-8c9b03d3314c', id, skill_weight FROM (
  VALUES 
    ('PostgreSQL', 100),
    ('SQL', 80)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;

-- -- Authentication & Authorization
-- INSERT INTO course_skills (course_id, skill_id, skill_weight)
-- SELECT '57e33569-82f8-48db-93c6-b9f7a7522b34', id, skill_weight FROM (
--   VALUES 
--     ('Authentication', 100),
--     ('Authorization', 100),
--     ('JWT', 60),
--     ('Security', 50),
--     ('OAuth 2.0', 40)
-- ) AS skills(name, skill_weight)
-- JOIN skills s ON s.name = skills.name;

-- -- Backend Deployment
-- INSERT INTO course_skills (course_id, skill_id, skill_weight)
-- SELECT '54b5cd34-a4a2-4933-b20e-4fc11387c5a6', id, skill_weight FROM (
--   VALUES 
--     ('Docker', 100),
--     ('CI/CD', 60),
--     ('Google Cloud', 60),
--     ('Nginx', 40)
-- ) AS skills(name, skill_weight)
-- JOIN skills s ON s.name = skills.name;
