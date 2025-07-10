-- ======================
-- Insert into tracks
-- ======================

INSERT INTO tracks (id, name, description, image_url)
VALUES
  ('00000000-0000-0000-0000-000000000003', 'Mobile Development', 'Develop mobile apps for Android and iOS.', 'uploads/track-images/mobile.png');
  -- ('00000000-0000-0000-0000-000000000002', 'Backend', 'Master the logic, databases, and server-side technologies.', 'uploads/track-images/backend.png');
  -- ('00000000-0000-0000-0000-000000000001', 'Frontend', 'Learn to build interactive and modern web interfaces.', 'https://cdn.example.com/images/frontend.png'),
--   ('00000000-0000-0000-0000-000000000003', 'Data Science', 'Explore data, statistics, and machine learning.', 'https://cdn.example.com/images/data-science.png'),
--   ('00000000-0000-0000-0000-000000000005', 'DevOps', 'Automate infrastructure and deliver faster using DevOps tools.', 'https://cdn.example.com/images/devops.png');


-- ======================
-- Insert into courses
-- ======================

-- ===== FRONTEND TRACK =====
-- INSERT INTO courses (id, name, description, image_url, duration, rating, track, total_lessons, track_id, order_number)
-- VALUES
--   (gen_random_uuid(), 'HTML Basics', 'Learn to structure web pages using HTML5.', 'https://cdn.example.com/images/html.png', 90, 4.5, 'Frontend', 8, '00000000-0000-0000-0000-000000000001', 1),
--   (gen_random_uuid(), 'CSS Fundamentals', 'Style your web pages using modern CSS.', 'https://cdn.example.com/images/css.png', 120, 4.6, 'Frontend', 10, '00000000-0000-0000-0000-000000000001', 2),
--   (gen_random_uuid(), 'JavaScript Essentials', 'Add interactivity using JavaScript.', 'https://cdn.example.com/images/js.png', 150, 4.7, 'Frontend', 12, '00000000-0000-0000-0000-000000000001', 3),
--   (gen_random_uuid(), 'Responsive Design', 'Make websites responsive and mobile-friendly.', 'https://cdn.example.com/images/responsive.png', 100, 4.4, 'Frontend', 9, '00000000-0000-0000-0000-000000000001', 4),
--   (gen_random_uuid(), 'React for Beginners', 'Build dynamic UIs using React.', 'https://cdn.example.com/images/react.png', 180, 4.8, 'Frontend', 14, '00000000-0000-0000-0000-000000000001', 5);

-- -- ===== BACKEND TRACK =====
-- INSERT INTO courses (id, name, description, image_url, duration, rating, track, total_lessons, track_id, order_number)
-- VALUES
--   (gen_random_uuid(), 'Node.js Basics', 'Learn backend development using Node.js.', 'uploads/course-images/nodejs-1.svg', 140, 4.5, 'Backend', 10, '00000000-0000-0000-0000-000000000002', 1),
--   (gen_random_uuid(), 'Express Framework', 'Build REST APIs using Express.', 'uploads/course-images/Express.svg', 120, 4.6, 'Backend', 9, '00000000-0000-0000-0000-000000000002', 2),
--   (gen_random_uuid(), 'PostgreSQL Essentials', 'Learn relational databases using PostgreSQL.', 'uploads/course-images/postgresql.svg', 130, 4.7, 'Backend', 10, '00000000-0000-0000-0000-000000000002', 3),
--   (gen_random_uuid(), 'Authentication & Authorization', 'Secure backend APIs with auth systems.', 'uploads/course-images/Digital Security.svg', 100, 4.4, 'Backend', 8, '00000000-0000-0000-0000-000000000002', 4),
--   (gen_random_uuid(), 'Backend Deployment', 'Deploy Node.js apps on cloud platforms.', 'uploads/course-images/google-cloud-1.svg', 90, 4.6, 'Backend', 7, '00000000-0000-0000-0000-000000000002', 5);

-- -- ===== DATA SCIENCE TRACK =====
-- INSERT INTO courses (name, description, image_url, duration, rating, track, total_lessons, track_id, order_number)
-- VALUES
--   ('Python for Data Science', 'Learn Python fundamentals for data tasks.', 'https://cdn.example.com/images/python.png', 150, 4.7, 'Data Science', 11, '00000000-0000-0000-0000-000000000003', 1),
--   ('Data Analysis with Pandas', 'Use Pandas to manipulate and analyze data.', 'https://cdn.example.com/images/pandas.png', 130, 4.6, 'Data Science', 9, '00000000-0000-0000-0000-000000000003', 2),
--   ('Data Visualization', 'Plot graphs and charts using Matplotlib & Seaborn.', 'https://cdn.example.com/images/visualization.png', 100, 4.5, 'Data Science', 8, '00000000-0000-0000-0000-000000000003', 3),
--   ('Machine Learning Basics', 'Understand ML algorithms and workflows.', 'https://cdn.example.com/images/ml.png', 180, 4.8, 'Data Science', 12, '00000000-0000-0000-0000-000000000003', 4),
--   ('Model Deployment', 'Deploy ML models using Flask and Docker.', 'https://cdn.example.com/images/model-deploy.png', 120, 4.6, 'Data Science', 9, '00000000-0000-0000-0000-000000000003', 5);

-- -- ===== MOBILE DEVELOPMENT TRACK =====
INSERT INTO courses (name, description, image_url, duration, rating, track, total_lessons, track_id, order_number)
VALUES
  ('Flutter for Beginners', 'Cross-platform apps using Flutter.', 'uploads/course-images/flutter.png', 160, 4.7, 'Mobile Development', 12, '00000000-0000-0000-0000-000000000003', 1),
  ('Intro to Android', 'Start building apps for Android using Kotlin.', 'uploads/course-images/android.png', 140, 4.5, 'Mobile Development', 10, '00000000-0000-0000-0000-000000000003', 2),
  ('iOS Development Basics', 'Develop iOS apps with Swift.', 'uploads/course-images/ios.png', 150, 4.6, 'Mobile Development', 11, '00000000-0000-0000-0000-000000000003', 3),
  ('React Native Basics', 'Use React Native to build mobile UIs.', 'uploads/course-images/react-native.png', 130, 4.6, 'Mobile Development', 10, '00000000-0000-0000-0000-000000000003', 4),
  ('Publishing to Stores', 'Publish apps to Google Play and App Store.', 'uploads/course-images/app-publish.png', 100, 4.5, 'Mobile Development', 8, '00000000-0000-0000-0000-000000000003', 5);

-- -- ===== DEVOPS TRACK =====
-- INSERT INTO courses (name, description, image_url, duration, rating, track, total_lessons, track_id, order_number)
-- VALUES
--   ('Linux Basics', 'Start with Linux commands and scripting.', 'https://cdn.example.com/images/linux.png', 100, 4.5, 'DevOps', 8, '00000000-0000-0000-0000-000000000005', 1),
--   ('Docker Essentials', 'Containerize applications using Docker.', 'https://cdn.example.com/images/docker.png', 120, 4.7, 'DevOps', 10, '00000000-0000-0000-0000-000000000005', 2),
--   ('CI/CD with GitHub Actions', 'Automate builds and tests with CI/CD.', 'https://cdn.example.com/images/cicd.png', 110, 4.6, 'DevOps', 9, '00000000-0000-0000-0000-000000000005', 3),
--   ('Kubernetes Basics', 'Orchestrate containers using Kubernetes.', 'https://cdn.example.com/images/k8s.png', 150, 4.8, 'DevOps', 12, '00000000-0000-0000-0000-000000000005', 4),
--   ('Cloud Fundamentals', 'Understand AWS and cloud basics.', 'https://cdn.example.com/images/cloud.png', 130, 4.5, 'DevOps', 10, '00000000-0000-0000-0000-000000000005', 5);
