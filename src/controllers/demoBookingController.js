const demoBookingService = require('../services/demoBookingService');

const getDemoBookings = async (_req, res) => {
  try {
    const data = await demoBookingService.listBookings();
    return res.status(200).json({ success: true, data, total: data.length, totalPages: 1 });
  } catch (error) {
    console.error('Failed to load demo bookings:', error);
    return res.status(500).json({ success: false, message: 'Unable to load demo bookings.' });
  }
};

const createDemoBooking = async (req, res) => {
  const body = req.body ?? {};
  const booking = {
    name: typeof body.name === 'string' ? body.name.trim() : '',
    company_name: typeof body.company_name === 'string' ? body.company_name.trim() : '',
    phone: typeof body.phone === 'string' ? body.phone.trim() : '',
    country: typeof body.country === 'string' ? body.country.trim() : '',
    email: typeof body.email === 'string' ? body.email.trim() : '',
  };

  const missingFields = Object.entries(booking)
    .filter(([, value]) => !value)
    .map(([field]) => field);

  if (missingFields.length) {
    return res.status(400).json({
      success: false,
      message: `Required fields are missing: ${missingFields.join(', ')}`,
    });
  }

  if (Object.values(booking).some((value) => value.length > 255)) {
    return res.status(400).json({ success: false, message: 'Each field must be 255 characters or fewer.' });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(booking.email)) {
    return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
  }

  try {
    // Public website submissions are recorded as system-created entries.
    const data = await demoBookingService.createBooking({ ...booking, created_by: 0 });
    return res.status(201).json({ success: true, message: 'Demo request received.', data });
  } catch (error) {
    console.error('Failed to create demo booking:', error);
    return res.status(500).json({ success: false, message: 'Unable to save the demo request.' });
  }
};

module.exports = { getDemoBookings, createDemoBooking };
