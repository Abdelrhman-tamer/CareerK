-- Beginner Roadmap
INSERT INTO roadmaps (id, track_id, level, title)
VALUES (
  'a1f87f4e-f7d7-4fd1-9f07-7e9a1453ba30',
  '00000000-0000-0000-0000-000000000003',
  'Beginner',
  'Mobile Developer Beginner Roadmap'
);

-- Sections
INSERT INTO roadmap_sections (id, roadmap_id, title, section_order)
VALUES
  ('b1a11234-9d21-4cd1-a26f-867ee0cf7615', 'a1f87f4e-f7d7-4fd1-9f07-7e9a1453ba30', 'Mobile Fundamentals', 1),
  ('b1a11235-9d21-4cd1-a26f-867ee0cf7615', 'a1f87f4e-f7d7-4fd1-9f07-7e9a1453ba30', 'Dart Basics', 2);

-- Steps: Mobile Fundamentals
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
VALUES 
  ('c1a11234-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11234-9d21-4cd1-a26f-867ee0cf7615',
   'How Mobile Apps Work', 'Understand native vs hybrid vs cross-platform.', 'https://youtu.be/fis26HvvDII?si=MEGEPf0ZZ7UxZcXo', ARRAY['Mobile Basics'], 1),
  ('c1a11235-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11234-9d21-4cd1-a26f-867ee0cf7615',
   'What is Flutter?', 'Get an overview of Flutter SDK.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter'], 2);

-- Steps: Dart Basics
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
VALUES 
  ('c1a11236-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11235-9d21-4cd1-a26f-867ee0cf7615',
   'Variables and Types in Dart', 'Learn Dart syntax, variables, and types.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Dart'], 1),
  ('c1a11237-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11235-9d21-4cd1-a26f-867ee0cf7615',
   'Control Flow in Dart', 'Practice with if-else, loops, and more.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Dart'], 2);



-- Intermediate Roadmap
INSERT INTO roadmaps (id, track_id, level, title)
VALUES (
  'd1f87f4e-f7d7-4fd1-9f07-7e9a1453ba31',
  '00000000-0000-0000-0000-000000000003',
  'Intermediate',
  'Mobile Developer Intermediate Roadmap'
);

-- Sections
INSERT INTO roadmap_sections (id, roadmap_id, title, section_order)
VALUES
  ('d1a11234-aaa1-4dd1-a26f-867ee0cf7615', 'd1f87f4e-f7d7-4fd1-9f07-7e9a1453ba31', 'Flutter Widgets & UI', 1),
  ('d1a11235-aaa1-4dd1-a26f-867ee0cf7615', 'd1f87f4e-f7d7-4fd1-9f07-7e9a1453ba31', 'Routing & State', 2);

-- Steps: Flutter Widgets
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
VALUES 
  ('e1a11234-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11234-aaa1-4dd1-a26f-867ee0cf7615',
   'Layout Widgets', 'Use Column, Row, Stack, and more.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter UI'], 1),
  ('e1a11235-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11234-aaa1-4dd1-a26f-867ee0cf7615',
   'Custom Widgets', 'Create your own reusable widgets.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter UI'], 2);

-- Steps: Navigation & State
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
VALUES 
  ('e1a11236-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11235-aaa1-4dd1-a26f-867ee0cf7615',
   'Navigation & Routes', 'Learn Navigator 1.0 vs 2.0.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter Routing'], 1),
  ('e1a11237-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11235-aaa1-4dd1-a26f-867ee0cf7615',
   'State Management (Provider)', 'Manage app state using Provider.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['State Management'], 2);



-- Advanced Roadmap
INSERT INTO roadmaps (id, track_id, level, title)
VALUES (
  'f1f87f4e-f7d7-4fd1-9f07-7e9a1453ba32',
  '00000000-0000-0000-0000-000000000003',
  'Advanced',
  'Mobile Developer Advanced Roadmap'
);

-- Sections
INSERT INTO roadmap_sections (id, roadmap_id, title, section_order)
VALUES
  ('f1a11234-bbb1-4ed1-a26f-867ee0cf7615', 'f1f87f4e-f7d7-4fd1-9f07-7e9a1453ba32', 'API & Backend Integration', 1),
  ('f1a11235-bbb1-4ed1-a26f-867ee0cf7615', 'f1f87f4e-f7d7-4fd1-9f07-7e9a1453ba32', 'Publishing Apps', 2);

-- Steps: API Integration
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
VALUES 
  ('f1a11236-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11234-bbb1-4ed1-a26f-867ee0cf7615',
   'Calling REST APIs', 'Use http package to fetch & send data.', 'https://youtu.be/fgdpvwEWJ9M?si=eoUPho5BxcCFWxLC', ARRAY['Flutter', 'API'], 1),
  ('f1a11237-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11234-bbb1-4ed1-a26f-867ee0cf7615',
   'Error Handling & Retry', 'Handle API errors properly.', 'https://youtu.be/fgdpvwEWJ9M?si=eoUPho5BxcCFWxLC', ARRAY['API Handling'], 2);

-- Steps: Publishing
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
VALUES 
  ('f1a11238-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11235-bbb1-4ed1-a26f-867ee0cf7615',
   'Publishing to Google Play', 'Learn steps to upload to Play Store.', 'https://youtu.be/C2DBDZKkLss?si=_52q5PYQL4aaTI9N', ARRAY['Deployment'], 1),
  ('f1a11239-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11235-bbb1-4ed1-a26f-867ee0cf7615',
   'Publishing to App Store', 'Upload apps to iOS App Store.', 'https://youtu.be/C2DBDZKkLss?si=_52q5PYQL4aaTI9N', ARRAY['Deployment', 'iOS'], 2);
