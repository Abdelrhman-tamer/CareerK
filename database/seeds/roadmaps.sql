-- Beginner Roadmap
INSERT INTO roadmaps (id, track_id, level, title) VALUES
('10000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Beginner', 'DevOps Beginner Roadmap');

-- Sections
INSERT INTO roadmap_sections (id, roadmap_id, title, section_order) VALUES
('02000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Linux Basics', 1),
('02000001-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Docker Essentials', 2);

-- Steps: Linux Basics
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order) VALUES 
('03000000-0000-0000-0000-000000000005', '02000000-0000-0000-0000-000000000005', 'Intro to Linux CLI', 'Understand basic Linux terminal commands', 'https://youtu.be/ROjZy1WbCIA', ARRAY['Linux'], 1),
('03000001-0000-0000-0000-000000000005', '02000000-0000-0000-0000-000000000005', 'File Permissions', 'Learn how file permissions work', 'https://youtu.be/kJr-PIfLDl0', ARRAY['Linux'], 2);

-- Steps: Docker Essentials
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order) VALUES 
('03000002-0000-0000-0000-000000000005', '02000001-0000-0000-0000-000000000005', 'Docker Concepts', 'Learn containers and images', 'https://youtu.be/fqMOX6JJhGo', ARRAY['Docker'], 1),
('03000003-0000-0000-0000-000000000005', '02000001-0000-0000-0000-000000000005', 'Build & Run Containers', 'Practice with docker build and run', 'https://youtu.be/3c-iBn73dDE', ARRAY['Docker'], 2);

-- Intermediate Roadmap
INSERT INTO roadmaps (id, track_id, level, title) VALUES
('10000001-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Intermediate', 'DevOps Intermediate Roadmap');

-- Sections
INSERT INTO roadmap_sections (id, roadmap_id, title, section_order) VALUES
('02000002-0000-0000-0000-000000000005', '10000001-0000-0000-0000-000000000005', 'CI/CD with GitHub Actions', 1),
('02000003-0000-0000-0000-000000000005', '10000001-0000-0000-0000-000000000005', 'Cloud Fundamentals', 2);

-- Steps: CI/CD
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order) VALUES 
('03000004-0000-0000-0000-000000000005', '02000002-0000-0000-0000-000000000005', 'What is CI/CD?', 'Explore continuous integration and delivery', 'https://youtu.be/scEDHsr3APg', ARRAY['CI/CD'], 1),
('03000005-0000-0000-0000-000000000005', '02000002-0000-0000-0000-000000000005', 'GitHub Actions Basics', 'Understand GitHub workflow YAMLs', 'https://youtu.be/-g4NSz4s4y8', ARRAY['GitHub Actions'], 2);

-- Steps: Cloud Fundamentals
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order) VALUES 
('03000006-0000-0000-0000-000000000005', '02000003-0000-0000-0000-000000000005', 'AWS Core Services', 'Intro to EC2, S3, and IAM', 'https://youtu.be/ulprqHHWlng', ARRAY['AWS'], 1),
('03000007-0000-0000-0000-000000000005', '02000003-0000-0000-0000-000000000005', 'Cloud Deployment', 'How to deploy using cloud', 'https://youtu.be/iaJZ8L_Eh0g', ARRAY['Cloud Computing'], 2);

-- Advanced Roadmap
INSERT INTO roadmaps (id, track_id, level, title) VALUES
('10000002-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000005', 'Advanced', 'DevOps Advanced Roadmap');

-- Sections
INSERT INTO roadmap_sections (id, roadmap_id, title, section_order) VALUES
('02000004-0000-0000-0000-000000000005', '10000002-0000-0000-0000-000000000005', 'Kubernetes Basics', 1),
('02000005-0000-0000-0000-000000000005', '10000002-0000-0000-0000-000000000005', 'Infrastructure as Code', 2);

-- Steps: Kubernetes Basics
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order) VALUES 
('03000008-0000-0000-0000-000000000005', '02000004-0000-0000-0000-000000000005', 'Kubernetes Architecture', 'Understand cluster structure', 'https://youtu.be/X48VuDVv0do', ARRAY['Kubernetes'], 1),
('03000009-0000-0000-0000-000000000005', '02000004-0000-0000-0000-000000000005', 'Pods, Deployments, Services', 'Manage resources in Kubernetes', 'https://youtu.be/PH-2FfFD2PU', ARRAY['Kubernetes'], 2);

-- Steps: Infrastructure as Code
INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order) VALUES 
('03000010-0000-0000-0000-000000000005', '02000005-0000-0000-0000-000000000005', 'Terraform Basics', 'Define infrastructure with code', 'https://youtu.be/yjAzXlHiJ2g', ARRAY['Terraform'], 1),
('03000011-0000-0000-0000-000000000005', '02000005-0000-0000-0000-000000000005', 'IaC Workflows', 'Automate provisioning', 'https://youtu.be/SLB_c_ayRMo', ARRAY['DevOps'], 2);




-- -- Beginner Roadmap
-- INSERT INTO roadmaps (id, track_id, level, title)
-- VALUES (
--   'a1f87f4e-f7d7-4fd1-9f07-7e9a1453ba30',
--   '00000000-0000-0000-0000-000000000003',
--   'Beginner',
--   'Mobile Developer Beginner Roadmap'
-- );

-- -- Sections
-- INSERT INTO roadmap_sections (id, roadmap_id, title, section_order)
-- VALUES
--   ('b1a11234-9d21-4cd1-a26f-867ee0cf7615', 'a1f87f4e-f7d7-4fd1-9f07-7e9a1453ba30', 'Mobile Fundamentals', 1),
--   ('b1a11235-9d21-4cd1-a26f-867ee0cf7615', 'a1f87f4e-f7d7-4fd1-9f07-7e9a1453ba30', 'Dart Basics', 2);

-- -- Steps: Mobile Fundamentals
-- INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
-- VALUES 
--   ('c1a11234-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11234-9d21-4cd1-a26f-867ee0cf7615',
--    'How Mobile Apps Work', 'Understand native vs hybrid vs cross-platform.', 'https://youtu.be/fis26HvvDII?si=MEGEPf0ZZ7UxZcXo', ARRAY['Mobile Basics'], 1),
--   ('c1a11235-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11234-9d21-4cd1-a26f-867ee0cf7615',
--    'What is Flutter?', 'Get an overview of Flutter SDK.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter'], 2);

-- -- Steps: Dart Basics
-- INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
-- VALUES 
--   ('c1a11236-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11235-9d21-4cd1-a26f-867ee0cf7615',
--    'Variables and Types in Dart', 'Learn Dart syntax, variables, and types.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Dart'], 1),
--   ('c1a11237-1234-4cc1-91f7-b9abf1cd9a01', 'b1a11235-9d21-4cd1-a26f-867ee0cf7615',
--    'Control Flow in Dart', 'Practice with if-else, loops, and more.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Dart'], 2);



-- -- Intermediate Roadmap
-- INSERT INTO roadmaps (id, track_id, level, title)
-- VALUES (
--   'd1f87f4e-f7d7-4fd1-9f07-7e9a1453ba31',
--   '00000000-0000-0000-0000-000000000003',
--   'Intermediate',
--   'Mobile Developer Intermediate Roadmap'
-- );

-- -- Sections
-- INSERT INTO roadmap_sections (id, roadmap_id, title, section_order)
-- VALUES
--   ('d1a11234-aaa1-4dd1-a26f-867ee0cf7615', 'd1f87f4e-f7d7-4fd1-9f07-7e9a1453ba31', 'Flutter Widgets & UI', 1),
--   ('d1a11235-aaa1-4dd1-a26f-867ee0cf7615', 'd1f87f4e-f7d7-4fd1-9f07-7e9a1453ba31', 'Routing & State', 2);

-- -- Steps: Flutter Widgets
-- INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
-- VALUES 
--   ('e1a11234-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11234-aaa1-4dd1-a26f-867ee0cf7615',
--    'Layout Widgets', 'Use Column, Row, Stack, and more.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter UI'], 1),
--   ('e1a11235-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11234-aaa1-4dd1-a26f-867ee0cf7615',
--    'Custom Widgets', 'Create your own reusable widgets.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter UI'], 2);

-- -- Steps: Navigation & State
-- INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
-- VALUES 
--   ('e1a11236-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11235-aaa1-4dd1-a26f-867ee0cf7615',
--    'Navigation & Routes', 'Learn Navigator 1.0 vs 2.0.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['Flutter Routing'], 1),
--   ('e1a11237-aaa1-4cc1-bb91-b9abf1cd9a01', 'd1a11235-aaa1-4dd1-a26f-867ee0cf7615',
--    'State Management (Provider)', 'Manage app state using Provider.', 'https://youtu.be/VPvVD8t02U8?si=nYypafxJF28DKKs-', ARRAY['State Management'], 2);



-- -- Advanced Roadmap
-- INSERT INTO roadmaps (id, track_id, level, title)
-- VALUES (
--   'f1f87f4e-f7d7-4fd1-9f07-7e9a1453ba32',
--   '00000000-0000-0000-0000-000000000003',
--   'Advanced',
--   'Mobile Developer Advanced Roadmap'
-- );

-- -- Sections
-- INSERT INTO roadmap_sections (id, roadmap_id, title, section_order)
-- VALUES
--   ('f1a11234-bbb1-4ed1-a26f-867ee0cf7615', 'f1f87f4e-f7d7-4fd1-9f07-7e9a1453ba32', 'API & Backend Integration', 1),
--   ('f1a11235-bbb1-4ed1-a26f-867ee0cf7615', 'f1f87f4e-f7d7-4fd1-9f07-7e9a1453ba32', 'Publishing Apps', 2);

-- -- Steps: API Integration
-- INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
-- VALUES 
--   ('f1a11236-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11234-bbb1-4ed1-a26f-867ee0cf7615',
--    'Calling REST APIs', 'Use http package to fetch & send data.', 'https://youtu.be/fgdpvwEWJ9M?si=eoUPho5BxcCFWxLC', ARRAY['Flutter', 'API'], 1),
--   ('f1a11237-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11234-bbb1-4ed1-a26f-867ee0cf7615',
--    'Error Handling & Retry', 'Handle API errors properly.', 'https://youtu.be/fgdpvwEWJ9M?si=eoUPho5BxcCFWxLC', ARRAY['API Handling'], 2);

-- -- Steps: Publishing
-- INSERT INTO roadmap_steps (id, section_id, title, description, resource_link, skills_covered, step_order)
-- VALUES 
--   ('f1a11238-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11235-bbb1-4ed1-a26f-867ee0cf7615',
--    'Publishing to Google Play', 'Learn steps to upload to Play Store.', 'https://youtu.be/C2DBDZKkLss?si=_52q5PYQL4aaTI9N', ARRAY['Deployment'], 1),
--   ('f1a11239-bbb1-4fc1-bb91-b9abf1cd9a01', 'f1a11235-bbb1-4ed1-a26f-867ee0cf7615',
--    'Publishing to App Store', 'Upload apps to iOS App Store.', 'https://youtu.be/C2DBDZKkLss?si=_52q5PYQL4aaTI9N', ARRAY['Deployment', 'iOS'], 2);
