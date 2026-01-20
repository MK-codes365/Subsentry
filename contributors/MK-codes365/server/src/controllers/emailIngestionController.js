const Subscription = require('../../models/Subscription');

// Hey! This controller handles the magic of turning parsed emails into actual subscription records.
// We also make sure we don't accidentally add the same sub twice if the scan runs again.
const handleEmailIngestion = async (req, res) => {
  try {
    const { userId, emails } = req.body;

    // Quick check to make sure we have what we need
    if (!userId || !emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: 'Need a userId and an array of emails to work with!' });
    }

    let stats = {
      added: 0,
      skipped: 0,
      failed: 0
    };

    // We'll process each email in the list
    for (const item of emails) {
      try {
        const { merchant, amount, date } = item;

        // Skip if the data is junk
        if (!merchant || amount === undefined || !date) {
            stats.failed++;
            continue;
        }

        const dateObj = new Date(date);
        
        // Let's see if this one is already in the database.
        // We match by name, price, and the specific day to avoid duplicates.
        const startOfDay = new Date(dateObj).setHours(0, 0, 0, 0);
        const endOfDay = new Date(dateObj).setHours(23, 59, 59, 999);

        const existing = await Subscription.findOne({
          user: userId,
          name: merchant,
          price: amount,
          startDate: { $gte: startOfDay, $lte: endOfDay }
        });

        if (existing) {
          stats.skipped++;
          continue;
        }

        // Map the fields over to our Subscription schema
        // We assume monthly billing by default if not specified.
        const renewalDate = new Date(dateObj);
        renewalDate.setMonth(renewalDate.getMonth() + 1);

        const newSub = new Subscription({
          name: merchant,
          price: amount,
          currency: item.currency || 'INR', // Default to INR since it's common here
          billingCycle: item.billingCycle || 'monthly',
          startDate: dateObj,
          renewalDate: renewalDate,
          source: 'email',
          user: userId,
          active: true
        });

        await newSub.save();
        stats.added++;

      } catch (innerErr) {
        console.error('Ran into a problem with an email:', innerErr);
        stats.failed++;
      }
    }

    res.status(200).json({
      success: true,
      message: 'Finished processing!',
      summary: stats
    });

  } catch (err) {
    console.error('Ingestion failed:', err);
    res.status(500).json({ error: 'Server error during ingestion' });
  }
};

module.exports = {
  handleEmailIngestion
};
