-- Insert chat rooms of type 'community'
INSERT INTO chat_rooms (id, type, name, description, image_url)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'community', 'JavaScript Enthusiasts', 'A place for JS lovers to share and learn.', 'https://cdn.example.com/js.png');



INSERT INTO community_groups (chat_room_id, name, description, image_url, interest_tag)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'JavaScript Enthusiasts', 'Discuss everything from ES6 to Node.js', 'https://cdn.example.com/js.png', 'javascript');
--   ('22222222-2222-2222-2222-222222222222', 'Python Masters', 'From Django to Data Science with Python', 'https://cdn.example.com/python.png', 'python'),
--   ('33333333-3333-3333-3333-333333333333', 'Frontend Devs', 'Design, animate, and build beautiful UIs', 'https://cdn.example.com/frontend.png', 'frontend'),
--   ('44444444-4444-4444-4444-444444444444', 'Backend Builders', 'Scale backends and build resilient APIs', 'https://cdn.example.com/backend.png', 'backend'),
--   ('55555555-5555-5555-5555-555555555555', 'Career & Interview Prep', 'Crack interviews and build careers', 'https://cdn.example.com/career.png', 'career');

-- Insert community groups using the above chat_room_id values



-- Insert chat rooms of type 'community'
--   ('22222222-2222-2222-2222-222222222222', 'community', 'Python Masters', 'All about Python, AI, ML and more.', 'https://cdn.example.com/python.png'),
--   ('33333333-3333-3333-3333-333333333333', 'community', 'Frontend Devs', 'CSS, React, Tailwind and UI/UX topics.', 'https://cdn.example.com/frontend.png'),
--   ('44444444-4444-4444-4444-444444444444', 'community', 'Backend Builders', 'Node, PostgreSQL, Docker, APIs and DevOps.', 'https://cdn.example.com/backend.png'),
--   ('55555555-5555-5555-5555-555555555555', 'community', 'Career & Interview Prep', 'DSA, System Design, Interview Advice.', 'https://cdn.example.com/career.png');