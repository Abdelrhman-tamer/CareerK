const { pool } = require("../../../config/db");
const BASE_URL = process.env.BASE_URL;

// ---------------------------------------------------
// Get Developer Profile by ID
// ---------------------------------------------------
const getDeveloperProfile = async (developerId) => {
    try {
        const query = `
        SELECT
          id,
          first_name,
          last_name,
          email,
          gender,
          date_of_birth,
          phone_number,
          country,
          city,
          address,
          brief_bio,
          skills,
          current_track,
          track_level,
          previous_job,
          type_of_job,
          years_of_experience,
          expected_salary,
          uploaded_cv,
          interested_courses,
          profile_picture,
          created_at,
          updated_at
        FROM developers
        WHERE id = $1
      `;

        const { rows } = await pool.query(query, [developerId]);
        const developer = rows[0];

        if (!developer) return null;

        // Clean profile picture & uploaded CV paths
        const cleanedProfilePicture = developer.profile_picture?.trim() || null;
        const cleanedUploadedCv = developer.uploaded_cv?.trim() || null;

        return {
            ...developer,
            profile_picture: cleanedProfilePicture,
            profilePictureLink: cleanedProfilePicture
                ? `${BASE_URL.replace(
                      /\/+$/,
                      ""
                  )}/${cleanedProfilePicture.replace(/^\/+/, "")}`
                : null,
            uploaded_cv: cleanedUploadedCv,
            uploadedCvLink: cleanedUploadedCv
                ? `${BASE_URL.replace(/\/+$/, "")}/${cleanedUploadedCv.replace(
                      /^\/+/,
                      ""
                  )}`
                : null,
        };
    } catch (error) {
        console.error("❌ Error in getDeveloperProfile service:", error);
        throw error;
    }
};
// const getDeveloperProfile = async (developerId) => {
//     try {
//         const query = `
//         SELECT
//           id,
//           first_name,
//           last_name,
//           email,
//           gender,
//           date_of_birth,
//           phone_number,
//           country,
//           city,
//           address,
//           brief_bio,
//           skills,
//           current_track,
//           track_level,
//           previous_job,
//           type_of_job,
//           years_of_experience,
//           expected_salary,
//           uploaded_cv,
//           interested_courses,
//           profile_picture,
//           created_at,
//           updated_at
//         FROM developers
//         WHERE id = $1
//       `;

//         const { rows } = await pool.query(query, [developerId]);
//         return rows[0] || null;
//     } catch (error) {
//         console.error("❌ Error in getDeveloperProfile service:", error);
//         throw error; // Let controller catch and handle the error
//     }
// };

// ---------------------------------------------------
// Update Developer Profile
// ---------------------------------------------------
const updateDeveloperProfile = async (developerId, updateData) => {
    try {
        let {
            first_name,
            last_name,
            gender,
            date_of_birth,
            phone_number,
            country,
            city,
            address,
            brief_bio,
            skills,
            current_track,
            track_level,
            previous_job,
            type_of_job,
            years_of_experience,
            expected_salary,
            uploaded_cv,
            interested_courses,
            profile_picture,
        } = updateData;

        // ✅ Convert empty strings to null for numeric/integer fields
        years_of_experience =
            years_of_experience === "" ? null : years_of_experience;
        expected_salary = expected_salary === "" ? null : expected_salary;

        // ✅ Convert arrays to PostgreSQL-compatible format
        const skillsArray =
            skills && skills.length ? `{${skills.join(",")}}` : null;
        const coursesArray =
            interested_courses && interested_courses.length
                ? `{${interested_courses.join(",")}}`
                : null;

        const query = `
            UPDATE developers
            SET
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                gender = COALESCE($3, gender),
                date_of_birth = COALESCE($4, date_of_birth),
                phone_number = COALESCE($5, phone_number),
                country = COALESCE($6, country),
                city = COALESCE($7, city),
                address = COALESCE($8, address),
                brief_bio = COALESCE($9, brief_bio),
                skills = COALESCE($10, skills),
                current_track = COALESCE($11, current_track),
                track_level = COALESCE($12, track_level),
                previous_job = COALESCE($13, previous_job),
                type_of_job = COALESCE($14, type_of_job),
                years_of_experience = COALESCE($15, years_of_experience),
                expected_salary = COALESCE($16, expected_salary),
                uploaded_cv = COALESCE($17, uploaded_cv),
                interested_courses = COALESCE($18, interested_courses),
                profile_picture = COALESCE($19, profile_picture),
                updated_at = NOW()
            WHERE id = $20
            RETURNING id, first_name, last_name, email, profile_picture, updated_at
        `;

        const values = [
            first_name || null,
            last_name || null,
            gender || null,
            date_of_birth || null,
            phone_number || null,
            country || null,
            city || null,
            address || null,
            brief_bio || null,
            skillsArray,
            current_track || null,
            track_level || null,
            previous_job || null,
            type_of_job || null,
            years_of_experience,
            expected_salary,
            uploaded_cv || null,
            coursesArray,
            profile_picture || null,
            developerId,
        ];

        const { rows } = await pool.query(query, values);
        return rows[0] || null;
    } catch (error) {
        console.error("❌ Error in updateDeveloperProfile service:", error);
        throw error;
    }
};

// const updateDeveloperProfile = async (developerId, updateData) => {
//     try {
//         const {
//             first_name,
//             last_name,
//             gender,
//             date_of_birth,
//             phone_number,
//             country,
//             city,
//             address,
//             brief_bio,
//             skills,
//             current_track,
//             track_level,
//             previous_job,
//             type_of_job,
//             years_of_experience,
//             expected_salary,
//             uploaded_cv,
//             interested_courses,
//             profile_picture,
//         } = updateData;

//         // ✅ Convert arrays to PostgreSQL-compatible format
//         const skillsArray = skills ? `{${skills.join(",")}}` : null;
//         const coursesArray = interested_courses
//             ? `{${interested_courses.join(",")}}`
//             : null;

//         const query = `
//             UPDATE developers
//             SET
//                 first_name = COALESCE($1, first_name),
//                 last_name = COALESCE($2, last_name),
//                 gender = COALESCE($3, gender),
//                 date_of_birth = COALESCE($4, date_of_birth),
//                 phone_number = COALESCE($5, phone_number),
//                 country = COALESCE($6, country),
//                 city = COALESCE($7, city),
//                 address = COALESCE($8, address),
//                 brief_bio = COALESCE($9, brief_bio),
//                 skills = COALESCE($10, skills),
//                 current_track = COALESCE($11, current_track),
//                 track_level = COALESCE($12, track_level),
//                 previous_job = COALESCE($13, previous_job),
//                 type_of_job = COALESCE($14, type_of_job),
//                 years_of_experience = COALESCE($15, years_of_experience),
//                 expected_salary = COALESCE($16, expected_salary),
//                 uploaded_cv = COALESCE($17, uploaded_cv),
//                 interested_courses = COALESCE($18, interested_courses),
//                 profile_picture = COALESCE($19, profile_picture),
//                 updated_at = NOW()
//             WHERE id = $20
//             RETURNING id, first_name, last_name, email, profile_picture, updated_at
//         `;

//         const values = [
//             first_name,
//             last_name,
//             gender,
//             date_of_birth,
//             phone_number,
//             country,
//             city,
//             address,
//             brief_bio,
//             skillsArray,
//             current_track,
//             track_level,
//             previous_job,
//             type_of_job,
//             years_of_experience,
//             expected_salary,
//             uploaded_cv,
//             coursesArray,
//             profile_picture,
//             developerId,
//         ];

//         const { rows } = await pool.query(query, values);
//         return rows[0] || null;
//     } catch (error) {
//         console.error("❌ Error in updateDeveloperProfile service:", error);
//         throw error;
//     }
// };

module.exports = {
    getDeveloperProfile,
    updateDeveloperProfile,
};
