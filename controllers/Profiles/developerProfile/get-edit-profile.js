const get_edit_profile = require("../../../services/Profiles/developerProfile/get-edit-profile");
const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const getProfile = async (req, res) => {
    try {
        const developerId = req.user.id; // Assuming auth middleware puts user into req.user

        const profile = await get_edit_profile.getDeveloperProfile(developerId);

        if (!profile) {
            return res
                .status(404)
                .json({ message: "Developer profile not found" });
        }

        return res.status(200).json(profile);
    } catch (error) {
        console.error("❌ Error fetching developer profile:", error);
        return res
            .status(500)
            .json({ message: "Internal Server Error", error: error.message });
    }
};

// ---------------------------------------------------
// Update Developer Profile
// ---------------------------------------------------
const updateProfile = async (req, res) => {
    try {
        const developerId = req.user.id;
        const updateData = req.body;

        // ✅ Handle profile picture upload
        if (req.files?.profile_picture?.[0]) {
            const relativePath = `uploads/profile_pictures/${req.files.profile_picture[0].filename}`;
            updateData.profile_picture = relativePath.replace(/^\/?/, "");
        }

        // ✅ Handle uploaded CV file
        if (req.files?.uploaded_cv?.[0]) {
            const relativePath = `uploads/cvs/${req.files.uploaded_cv[0].filename}`;
            updateData.uploaded_cv = relativePath.replace(/^\/?/, "");
        }

        // ✅ Normalize `skills` to array
        if (updateData.skills && typeof updateData.skills === "string") {
            try {
                updateData.skills = JSON.parse(updateData.skills);
            } catch {
                updateData.skills = updateData.skills
                    .split(",")
                    .map((s) => s.trim());
            }
        }

        // ✅ Normalize `interested_courses` to array
        if (
            updateData.interested_courses &&
            typeof updateData.interested_courses === "string"
        ) {
            try {
                updateData.interested_courses = JSON.parse(
                    updateData.interested_courses
                );
            } catch {
                updateData.interested_courses = updateData.interested_courses
                    .split(",")
                    .map((c) => c.trim());
            }
        }

        const updatedDeveloper = await get_edit_profile.updateDeveloperProfile(
            developerId,
            updateData
        );

        if (!updatedDeveloper) {
            return res.status(404).json({ message: "Developer not found" });
        }

        return res.status(200).json({
            message: "Profile updated successfully",
            developer: updatedDeveloper,
        });
    } catch (error) {
        console.error("❌ Error updating developer profile:", error);
        return res.status(500).json({ message: "Server Error" });
    }
};
// const updateProfile = async (req, res) => {
//     try {
//         const developerId = req.user.id;
//         const updateData = req.body;

//         // ✅ Handle profile picture upload
//         if (req.files?.profile_picture?.[0]) {
//             const relativePath = `uploads/profile_pictures/${req.files.profile_picture[0].filename}`;
//             // ✅ Save only relative path in DB
//             updateData.profile_picture = relativePath.replace(/^\/?/, "");
//         }

//         // ✅ Handle uploaded CV file
//         if (req.files?.uploaded_cv?.[0]) {
//             const relativePath = `uploads/cvs/${req.files.uploaded_cv[0].filename}`;
//             // ✅ Save only relative path in DB
//             updateData.uploaded_cv = relativePath.replace(/^\/?/, "");
//         }

//         const updatedDeveloper = await get_edit_profile.updateDeveloperProfile(
//             developerId,
//             updateData
//         );

//         if (!updatedDeveloper) {
//             return res.status(404).json({ message: "Developer not found" });
//         }

//         return res.status(200).json({
//             message: "Profile updated successfully",
//             developer: updatedDeveloper,
//         });
//     } catch (error) {
//         console.error("❌ Error updating developer profile:", error);
//         return res.status(500).json({ message: "Server Error" });
//     }
// };

module.exports = { getProfile, updateProfile };
