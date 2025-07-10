const companyHomepage = require('../../services/Homepages/company');

// Main homepage
async function getCompanyHomepage(req, res) {
  try {
    const companyId = req.user.id;

    const [companyInfo, availableDevelopers, recentAppliedDevelopers] = await Promise.all([
      companyHomepage.getCompanyInfo(companyId),
      companyHomepage.getAvailableDevelopers(),
      companyHomepage.getRecentAppliedDevelopers(companyId)
    ]);

    return res.status(200).json({
      companyInfo,
      availableDevelopers,
      recentAppliedDevelopers
    });
  } catch (error) {
    console.error('Error fetching company homepage:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// GET /company/:developerId/cv
async function getDeveloperCvController(req, res) {
  try {
    const developerId = req.params.developerId;
    const result = await companyHomepage.getDeveloperCv(developerId);

    return res.status(200).json({
      uploaded_cv: result.uploaded_cv,
      uploaded_cv_link: result.uploaded_cv_link,
      // generated_cv: result.generated_cv
    });
  } catch (error) {
    console.error('Error fetching developer CV:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


// GET /company/application/:applicationId
async function getApplicationDetailsController(req, res) {
  try {
    const applicationId = req.params.applicationId;
    const result = await companyHomepage.getJobApplicationDetails(applicationId);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching application details:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = {
  getCompanyHomepage,
  getDeveloperCvController,
  getApplicationDetailsController
};
