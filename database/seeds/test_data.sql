INSERT INTO tracks (id, name, description, image_url)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Frontend', 'Learn to build interactive and modern web interfaces.', 'https://cdn.example.com/images/frontend.png');


  INSERT INTO courses (id, name, description, image_url, duration, rating, track, total_lessons, track_id, order_number)
VALUES
  (gen_random_uuid(), 'HTML Basics', 'Learn to structure web pages using HTML5.', 'https://cdn.example.com/images/html.png', 90, 4.5, 'Frontend', 8, '00000000-0000-0000-0000-000000000001', 1),
  (gen_random_uuid(), 'CSS Fundamentals', 'Style your web pages using modern CSS.', 'https://cdn.example.com/images/css.png', 120, 4.6, 'Frontend', 10, '00000000-0000-0000-0000-000000000001', 2),
  (gen_random_uuid(), 'JavaScript Essentials', 'Add interactivity using JavaScript.', 'https://cdn.example.com/images/js.png', 150, 4.7, 'Frontend', 12, '00000000-0000-0000-0000-000000000001', 3),
  (gen_random_uuid(), 'Responsive Design', 'Make websites responsive and mobile-friendly.', 'https://cdn.example.com/images/responsive.png', 100, 4.4, 'Frontend', 9, '00000000-0000-0000-0000-000000000001', 4),
  (gen_random_uuid(), 'React for Beginners', 'Build dynamic UIs using React.', 'https://cdn.example.com/images/react.png', 180, 4.8, 'Frontend', 14, '00000000-0000-0000-0000-000000000001', 5);