-- 🔹 Course Contents
INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Linux Basics' LIMIT 1),
   'video', 'Getting Started with Linux', 'https://youtu.be/tAZ5Gh8XKhE', 2000, 1);

-- 🔸 Quiz
INSERT INTO public.course_contents (course_id, type, title, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Linux Basics' LIMIT 1),
   'quiz', 'Linux Basics Quiz', 2);

-- 📝 Quiz Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE title = 'Linux Basics Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Linux Basics') LIMIT 1),
   'What does the "cd" command do?',
   '["Change directory", "Copy file", "Create directory"]',
   'Change directory'),
  ((SELECT id FROM public.course_contents WHERE title = 'Linux Basics Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Linux Basics') LIMIT 1),
   'Which user has full system access?',
   '["root", "admin", "sudo"]',
   'root');

-- 🔹 Course Contents
INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Docker Essentials' LIMIT 1),
   'video', 'Docker Introduction & Setup', 'https://youtu.be/3c-iBn73dDE', 2100, 1);

-- 🔸 Quiz
INSERT INTO public.course_contents (course_id, type, title, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Docker Essentials' LIMIT 1),
   'quiz', 'Docker Basics Quiz', 2);

-- 📝 Quiz Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE title = 'Docker Basics Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Docker Essentials') LIMIT 1),
   'What is a Docker container?',
   '["A lightweight, portable environment", "A virtual machine", "A Python library"]',
   'A lightweight, portable environment'),
  ((SELECT id FROM public.course_contents WHERE title = 'Docker Basics Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Docker Essentials') LIMIT 1),
   'What command builds a Docker image?',
   '["docker build", "docker run", "docker start"]',
   'docker build');


-- 🔹 Course Contents
INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions' LIMIT 1),
   'video', 'CI/CD Introduction and YAML Workflow', 'https://youtu.be/-g4NSz4s4y8', 1900, 1);

-- 🔸 Quiz
INSERT INTO public.course_contents (course_id, type, title, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions' LIMIT 1),
   'quiz', 'CI/CD Concepts Quiz', 2);

-- 📝 Quiz Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE title = 'CI/CD Concepts Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions') LIMIT 1),
   'What does CI stand for?',
   '["Continuous Integration", "Code Integration", "Cloud Infrastructure"]',
   'Continuous Integration'),
  ((SELECT id FROM public.course_contents WHERE title = 'CI/CD Concepts Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions') LIMIT 1),
   'Which file is used to define GitHub Actions workflow?',
   '[".yml file", ".env file", "Dockerfile"]',
   '.yml file');


-- 🔹 Course Contents
INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Kubernetes Basics' LIMIT 1),
   'video', 'Kubernetes Architecture & Pods', 'https://youtu.be/X48VuDVv0do', 2400, 1);

-- 🔸 Quiz
INSERT INTO public.course_contents (course_id, type, title, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Kubernetes Basics' LIMIT 1),
   'quiz', 'Kubernetes Quiz', 2);

-- 📝 Quiz Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE title = 'Kubernetes Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Kubernetes Basics') LIMIT 1),
   'What is a pod in Kubernetes?',
   '["A group of containers", "A container", "A storage unit"]',
   'A group of containers'),
  ((SELECT id FROM public.course_contents WHERE title = 'Kubernetes Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Kubernetes Basics') LIMIT 1),
   'Which component schedules pods to nodes?',
   '["Kube-scheduler", "Kube-proxy", "Kubectl"]',
   'Kube-scheduler');



-- 🔹 Course Contents
INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals' LIMIT 1),
   'video', 'AWS Cloud Concepts Overview', 'https://youtu.be/ulprqHHWlng', 2000, 1);

-- 🔸 Quiz
INSERT INTO public.course_contents (course_id, type, title, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals' LIMIT 1),
   'quiz', 'Cloud Basics Quiz', 2);

-- 📝 Quiz Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE title = 'Cloud Basics Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals') LIMIT 1),
   'Which of the following is a cloud provider?',
   '["AWS", "Docker", "MySQL"]',
   'AWS'),
  ((SELECT id FROM public.course_contents WHERE title = 'Cloud Basics Quiz' AND course_id = (SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals') LIMIT 1),
   'What is EC2 used for?',
   '["Virtual machines", "Data analysis", "Networking only"]',
   'Virtual machines');

-- 🔸 Linux Basics Reviews
INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Linux Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'mohamed' AND last_name = 'ahmed' LIMIT 1),
   5, 'Very clear explanation of basic Linux commands.'),
  ((SELECT id FROM public.courses WHERE name = 'Linux Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
   4, 'Helpful for beginners, especially the scripting part.'),
  ((SELECT id FROM public.courses WHERE name = 'Linux Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
   5, 'Great foundation for understanding the terminal.'),
  ((SELECT id FROM public.courses WHERE name = 'Linux Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
   4, 'More real-world examples would be nice.');

-- 🔸 Docker Essentials Reviews
INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Docker Essentials' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'mohamed' AND last_name = 'ahmed' LIMIT 1),
   5, 'Now Docker feels so much easier!'),
  ((SELECT id FROM public.courses WHERE name = 'Docker Essentials' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
   4, 'Perfect starter for container concepts.'),
  ((SELECT id FROM public.courses WHERE name = 'Docker Essentials' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
   5, 'Loved the hands-on examples.'),
  ((SELECT id FROM public.courses WHERE name = 'Docker Essentials' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
   4, 'It explained volumes and images really well.');

-- 🔸 CI/CD with GitHub Actions Reviews
INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
VALUES
  ((SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'mohamed' AND last_name = 'ahmed' LIMIT 1),
   5, 'Finally understood CI/CD thanks to this course!'),
  ((SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
   4, 'A good explanation of workflows and YAML.'),
  ((SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
   5, 'Clear breakdown of GitHub Action triggers.'),
  ((SELECT id FROM public.courses WHERE name = 'CI/CD with GitHub Actions' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
   4, 'Wish there were more advanced pipeline examples.');

-- 🔸 Kubernetes Basics Reviews
INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Kubernetes Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'mohamed' AND last_name = 'ahmed' LIMIT 1),
   5, 'Really helped me grasp container orchestration.'),
  ((SELECT id FROM public.courses WHERE name = 'Kubernetes Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
   4, 'Excellent overview of K8s concepts.'),
  ((SELECT id FROM public.courses WHERE name = 'Kubernetes Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
   5, 'Pods, services, and deployments are finally clear.'),
  ((SELECT id FROM public.courses WHERE name = 'Kubernetes Basics' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
   4, 'Would love more advanced examples.');

-- 🔸 Cloud Fundamentals Reviews
INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'mohamed' AND last_name = 'ahmed' LIMIT 1),
   5, 'Great for understanding AWS services.'),
  ((SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
   4, 'Well explained cloud basics and pricing.'),
  ((SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
   5, 'Finally understood EC2 and S3 clearly.'),
  ((SELECT id FROM public.courses WHERE name = 'Cloud Fundamentals' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
   4, 'Could use more Azure and GCP comparison.');


-- 🔸 Linux Basics Skills
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT 
  (SELECT id FROM courses WHERE name = 'Linux Basics' LIMIT 1),
  id, skill_weight
FROM (
  VALUES 
    ('Linux', 100)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;

-- 🔸 Docker Essentials Skills
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT 
  (SELECT id FROM courses WHERE name = 'Docker Essentials' LIMIT 1),
  id, skill_weight
FROM (
  VALUES 
    ('Docker', 100),
    ('DevOps', 60)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;

-- 🔸 CI/CD with GitHub Actions Skills
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT 
  (SELECT id FROM courses WHERE name = 'CI/CD with GitHub Actions' LIMIT 1),
  id, skill_weight
FROM (
  VALUES 
    ('CI/CD', 100),
    ('GitHub Actions', 100)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;

-- 🔸 Kubernetes Basics Skills
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT 
  (SELECT id FROM courses WHERE name = 'Kubernetes Basics' LIMIT 1),
  id, skill_weight
FROM (
  VALUES 
    ('Kubernetes', 100)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;

-- 🔸 Cloud Fundamentals Skills
INSERT INTO course_skills (course_id, skill_id, skill_weight)
SELECT 
  (SELECT id FROM courses WHERE name = 'Cloud Fundamentals' LIMIT 1),
  id, skill_weight
FROM (
  VALUES 
    ('Cloud Computing', 100),
    ('AWS', 90),
    ('DevOps', 60)
) AS skills(name, skill_weight)
JOIN skills s ON s.name = skills.name;



-- INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
--    'video', 'Introduction to Flutter', 'https://youtu.be/VPvVD8t02U8?si=4sBMSVG56N-188wa', 2199, 1);


-- -- Insert Quiz After Lessons
-- INSERT INTO public.course_contents (course_id, type, title, "order")
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
--    'quiz', 'Flutter Basics Quiz 1', 2),
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
--    'quiz', 'Flutter Basics Quiz 2', 3),
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
--    'quiz', 'Flutter Final Quiz', 4);

-- -- Quiz 1 Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 1' LIMIT 1),
--    'What is Flutter primarily used for?',
--    '["Building cross-platform mobile apps", "Server-side programming", "Database management"]',
--    'Building cross-platform mobile apps'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 1' LIMIT 1),
--    'Which programming language is used with Flutter?',
--    '["Dart", "JavaScript", "Python"]',
--    'Dart');

-- -- Quiz 2 Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 2' LIMIT 1),
--    'What are the basic building blocks of Flutter apps?',
--    '["Widgets", "Functions", "Classes"]',
--    'Widgets'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 2' LIMIT 1),
--    'Which widget would you use for a scrollable list?',
--    '["ListView", "Column", "Container"]',
--    'ListView');

-- -- Final Quiz Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Final Quiz' LIMIT 1),
--    'What command creates a new Flutter project?',
--    '["flutter create", "dart new", "flutter init"]',
--    'flutter create'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Final Quiz' LIMIT 1),
--    'Which widget is used for basic layout structure?',
--    '["Scaffold", "AppBar", "MaterialApp"]',
--    'Scaffold');

-- -- Insert Reviews
-- INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'mohamed' AND last_name = 'ahmed' LIMIT 1),
--    5, 'Perfect introduction to mobile development with Flutter!'),
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
--    4, 'Great way to start building cross-platform apps.'),
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
--    5, 'The widget explanations were particularly helpful.'),
--   ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
--    4, 'Would love more advanced examples, but excellent foundation.');


-- -- Adding real developers
-- INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
-- VALUES (
--   (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
--   (SELECT id FROM public.developers WHERE first_name = 'ahmed' AND last_name = 'yasser' LIMIT 1),
--   4,  -- Replace with actual rating (1-5)
--   'Great course for beginners!'  -- Replace with actual comment
-- );

