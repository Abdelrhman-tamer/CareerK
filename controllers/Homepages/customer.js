const customerHomepageService = require('../../services/Homepages/customer');

exports.getCustomerHomepage = async (req, res) => {
  try {
    const customerId = req.user.id; // assuming customer is authenticated

    const profile = await customerHomepageService.getCustomerProfile(customerId);
    const services = await customerHomepageService.getCustomerServices(customerId);

    return res.status(200).json({
      profile,
      services
    });
  } catch (error) {
    console.error('Error fetching customer homepage:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
