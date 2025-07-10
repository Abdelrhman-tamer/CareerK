INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
   'video', 'Introduction to Flutter', 'https://youtu.be/VPvVD8t02U8?si=4sBMSVG56N-188wa', 2199, 1);


-- Insert Quiz After Lessons
INSERT INTO public.course_contents (course_id, type, title, "order")
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
   'quiz', 'Flutter Basics Quiz 1', 2),
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
   'quiz', 'Flutter Basics Quiz 2', 3),
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1),
   'quiz', 'Flutter Final Quiz', 4);

-- Quiz 1 Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 1' LIMIT 1),
   'What is Flutter primarily used for?',
   '["Building cross-platform mobile apps", "Server-side programming", "Database management"]',
   'Building cross-platform mobile apps'),
  ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 1' LIMIT 1),
   'Which programming language is used with Flutter?',
   '["Dart", "JavaScript", "Python"]',
   'Dart');

-- Quiz 2 Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 2' LIMIT 1),
   'What are the basic building blocks of Flutter apps?',
   '["Widgets", "Functions", "Classes"]',
   'Widgets'),
  ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Basics Quiz 2' LIMIT 1),
   'Which widget would you use for a scrollable list?',
   '["ListView", "Column", "Container"]',
   'ListView');

-- Final Quiz Questions
INSERT INTO public.quiz_questions (content_id, question, options, correct)
VALUES 
  ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Final Quiz' LIMIT 1),
   'What command creates a new Flutter project?',
   '["flutter create", "dart new", "flutter init"]',
   'flutter create'),
  ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners') AND title = 'Flutter Final Quiz' LIMIT 1),
   'Which widget is used for basic layout structure?',
   '["Scaffold", "AppBar", "MaterialApp"]',
   'Scaffold');

-- Insert Reviews
INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
VALUES
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'mohamed' AND last_name = 'ahmed' LIMIT 1),
   5, 'Perfect introduction to mobile development with Flutter!'),
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
   4, 'Great way to start building cross-platform apps.'),
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
   5, 'The widget explanations were particularly helpful.'),
  ((SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
   (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
   4, 'Would love more advanced examples, but excellent foundation.');


-- Adding real developers
INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
VALUES (
  (SELECT id FROM public.courses WHERE name = 'Flutter for Beginners' LIMIT 1), 
  (SELECT id FROM public.developers WHERE first_name = 'ahmed' AND last_name = 'yasser' LIMIT 1),
  4,  -- Replace with actual rating (1-5)
  'Great course for beginners!'  -- Replace with actual comment
);

-- INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1),
--    'video', 'Introduction to Node.js', 'https://youtu.be/Oe421EPjeBE?si=Xxn8DxairZ4sXLpD', 496, 1);

-- -- Insert Quiz After Lessons
-- INSERT INTO public.course_contents (course_id, type, title, "order")
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1),
--    'quiz', 'Node.js Basics Quiz 1', 2),
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1),
--    'quiz', 'Node.js Basics Quiz 2', 3),
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1),
--    'quiz', 'Node.js Basics Final Quiz', 4);

-- -- Quiz 1 Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Node.js Basics') AND title = 'Node.js Basics Quiz 1' LIMIT 1),
--    'What is Node.js?',
--    '["JavaScript runtime built on Chrome V8 engine", "A frontend framework", "A database management system"]',
--    'JavaScript runtime built on Chrome V8 engine'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Node.js Basics') AND title = 'Node.js Basics Quiz 1' LIMIT 1),
--    'Which command installs a package using npm?',
--    '["npm install", "node install", "npm get"]',
--    'npm install');

-- -- Quiz 2 Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Node.js Basics') AND title = 'Node.js Basics Quiz 2' LIMIT 1),
--    'What module is used to create a web server in Node.js?',
--    '["http", "server", "web"]',
--    'http'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Node.js Basics') AND title = 'Node.js Basics Quiz 2' LIMIT 1),
--    'Which method is used to handle GET requests in Express.js?',
--    '["app.get()", "app.handleGet()", "app.request()"]',
--    'app.get()');

-- -- Final Quiz Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Node.js Basics') AND title = 'Node.js Basics Final Quiz' LIMIT 1),
--    'What does the require() function do?',
--    '["Imports modules", "Checks for errors", "Requires user input"]',
--    'Imports modules'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'Node.js Basics') AND title = 'Node.js Basics Final Quiz' LIMIT 1),
--    'Which global object is available in all Node.js modules?',
--    '["module", "global", "window"]',
--    'module');



-- INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'khaled' AND last_name = 'ahmed' LIMIT 1),
--    5, 'Excellent introduction to backend development with Node.js.'),
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
--    4, 'Great course for understanding the fundamentals of Node.js.'),
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
--    4, 'Practical examples would make this even better, but solid content.'),
--   ((SELECT id FROM public.courses WHERE name = 'Node.js Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
--    5, 'Perfect starting point for anyone interested in Node.js development!');



-- -- Insert Video Lessons for 'HTML Basics'
-- INSERT INTO public.course_contents (course_id, type, title, video_url, video_time_minutes, "order")
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'video', 'Introduction to HTML', 'https://youtu.be/6QAELgirvjs?si=KmpaUH991ldp-0Fd', 11, 1),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'video', 'Elements And Browser', 'https://youtu.be/7LxA9qXUY5k?si=6a6Ri24r2R6B1CH5', 4, 2),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'video', 'First Project And First Page', 'https://youtu.be/QG5aEmS9Fu0?si=XC9W6dLHS8paXkg7', 9, 4),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'video', 'Head And Nested Elements', 'https://youtu.be/dVgTBEYCseU?si=wev0JLhw--RijHiX', 8, 5),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'video', 'Comments And Use Cases', 'https://youtu.be/3lXuWHtm7PM?si=ABgh0V0Pj5s5xHbX', 5, 7);

-- -- Insert Quiz After Lessons
-- INSERT INTO public.course_contents (course_id, type, title, "order")
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'quiz', 'HTML Basics Quiz 1', 3),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'quiz', 'HTML Basics Quiz 2', 6),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1),
--    'quiz', 'HTML Basics Final Quiz', 8);

-- -- Quiz 1 Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'HTML Basics') AND title = 'HTML Basics Quiz 1' LIMIT 1),
--    'What does HTML stand for?',
--    '["HyperText Markup Language", "Home Tool Markup Language", "Hyperlinks and Text Markup Language"]',
--    'HyperText Markup Language'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'HTML Basics') AND title = 'HTML Basics Quiz 1' LIMIT 1),
--    'Which tag is used to create a hyperlink in HTML?',
--    '["<a>", "<link>", "<href>"]',
--    '<a>');

-- -- Quiz 2 Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'HTML Basics') AND title = 'HTML Basics Quiz 2' LIMIT 1),
--    'What tag is used for inserting an image?',
--    '["<img>", "<src>", "<picture>"]',
--    '<img>'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'HTML Basics') AND title = 'HTML Basics Quiz 2' LIMIT 1),
--    'Which tag is used for creating an ordered list?',
--    '["<ol>", "<ul>", "<li>"]',
--    '<ol>');

-- -- Final Quiz Questions
-- INSERT INTO public.quiz_questions (content_id, question, options, correct)
-- VALUES 
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'HTML Basics') AND title = 'HTML Basics Final Quiz' LIMIT 1),
--    'Which tag defines the largest heading?',
--    '["<h1>", "<head>", "<heading>"]',
--    '<h1>'),
--   ((SELECT id FROM public.course_contents WHERE course_id = (SELECT id FROM public.courses WHERE name = 'HTML Basics') AND title = 'HTML Basics Final Quiz' LIMIT 1),
--    'Where does the <title> tag appear in an HTML document?',
--    '["Inside <head>", "Inside <body>", "Outside <html>"]',
--    'Inside <head>');

-- INSERT INTO public.course_reviews (course_id, developer_id, rating, comment)
-- VALUES
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'khaled' AND last_name = 'ahmed' LIMIT 1),
--    5, 'Perfect course for beginners. Very clear explanations.'),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'omar' AND last_name = 'tarek' LIMIT 1),
--    4, 'Solid foundation in HTML. Helped me get started with web dev.'),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'yasser' AND last_name = 'adel' LIMIT 1),
--    4, 'Would love more real-world examples, but great overall.'),
--   ((SELECT id FROM public.courses WHERE name = 'HTML Basics' LIMIT 1), 
--    (SELECT id FROM public.developers WHERE first_name = 'hassan' AND last_name = 'mostafa' LIMIT 1),
--    5, 'Exactly what I needed to start my frontend journey!');







