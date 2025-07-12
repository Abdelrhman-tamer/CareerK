// server.js - Main entry point
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { init: initSocket, getIO } = require("./config/socket");
const passport = require("passport"); // 🔹 Import Passport.js
const { connectDB } = require("./config/db");

dotenv.config();

const app = express();
connectDB(); // Connect to PostgreSQL
const server = http.createServer(app);
initSocket(server);

// Middleware to attach io to req
app.use((req, res, next) => {
    req.io = getIO(); // Attach io to every request
    next();
});

// Middleware
// Increase the limit
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors());
app.use(morgan("dev"));
app.use(passport.initialize()); // 🔹 Initialize Passport.js

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(
    "/uploads/profile_pictures",
    express.static(path.join(__dirname, "uploads/profile_pictures"))
);

// Routes
app.use("/api/developer", require("./routes/Sign-up/developer"));
app.use("/api/company", require("./routes/Sign-up/company"));
app.use("/api/customer", require("./routes/Sign-up/customer"));
app.use("/api/auth", require("./routes/Login/auth-login"));
app.use("/api/password", require("./routes/Login/password-Reset"));

app.use("/api/job-post", require("./routes/jobs-services/job-post"));
app.use(
    "/api/job-application",
    require("./routes/jobs-services/job-Application")
);
app.use("/api/service-post", require("./routes/jobs-services/service-post"));
app.use(
    "/api/service-application",
    require("./routes/jobs-services/service-Application")
);
// app.use('/api/recommendations-old', require('./routes/jobs-services/recommendations'));

app.use("/api/recommendations", require("./routes/recommendationRoutes"));

app.use("/api/developer", require("./routes/Profiles/developer"));
app.use("/api/company", require("./routes/Profiles/company"));
app.use("/api/customer", require("./routes/Profiles/customer"));

app.use("/api/developer", require("./routes/Homepages/developer"));
app.use("/api/company", require("./routes/Homepages/company"));
app.use("/api/customer", require("./routes/Homepages/customer"));

app.use(
    "/api/courses-page",
    require("./routes/Courses-tracks-roadmaps/courses-page")
);
app.use(
    "/api/tracks-page",
    require("./routes/Courses-tracks-roadmaps/tracks-courses")
);
app.use(
    "/api/course-details",
    require("./routes/Courses-tracks-roadmaps/course-details")
);
app.use(
    "/api/course-enrollment",
    require("./routes/Courses-tracks-roadmaps/course-enrollment-progress")
);

app.use("/api/private-chats", require("./routes/chats/privateChat"));
app.use("/api/community", require("./routes/chats/communityRoutes"));
// app.use('/api/community-new', require('./routes/chats/communityChat'));

app.use("/api/notifications", require("./routes/notifications"));
app.use("/api/bookmarks", require("./routes/bookmarks"));
app.use("/api/course-bookmarks", require("./routes/course-bookmarks"));

app.use("/api/cv-generation", require("./routes/cv-generation"));

app.use("/api/roadmaps", require("./routes/Roadmaps/roadmapRoutes"));

app.use("/api/cv", require("./routes/cvFetch-download"));

app.use("/api/chatbot", require("./routes/chatbotRoutes"));

app.use("/api/ai_skills", require("./routes/ai_skills_dev"));

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
