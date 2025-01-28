const pool = require('../config/db');
const NodeCache = require('node-cache');

/**
 * In-memory cache for slot data with a default time-to-live (TTL) of 600 seconds.
 * This cache is used to store the results of frequently accessed queries for improved performance.
 * 
 * @constant {NodeCache}
 */
const slotCache = new NodeCache({ stdTTL: 600 }); // Cache expires in 10 minutes

/**
 * Adds time slots for the next seven days into the database.
 * Ensures that slots for each unit are created only if they do not already exist for a specific date.
 * 
 * @async
 * @function addSlotsForNextSevenDays
 * @returns {Promise<void>} Resolves when the slots are successfully added to the database.
 * @throws {Error} Logs any error that occurs during slot creation.
 */
 async function addSlotsForNextSevenDays() {
  try {
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']; // Predefined time slots

    // Fetch all unit IDs from the database
    const units = await pool.query('SELECT id FROM units');
    if (units.rows.length === 0) {
      console.warn('No units found in the database. Skipping slot creation.');
      return;
    }

    // Iterate over the next 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i); // Increment day
      const formattedDate = date.toISOString().split('T')[0]; // Format date as YYYY-MM-DD

      // Iterate over each unit
      for (const unit of units.rows) {
        try {
          const existingCount = await pool.query('SELECT COUNT(*) FROM slots WHERE date = $1 AND unit_id = $2', [formattedDate, unit.id]);

          // If no slots exist for the given date and unit, create new slots
          if (parseInt(existingCount.rows[0].count, 10) === 0) {
            for (const time of timeSlots) {
              await pool.query(
                'INSERT INTO slots (time, is_booked, date, unit_id) VALUES ($1, false, $2, $3)',
                [time, formattedDate, unit.id]
              );
            }
          }
        } catch (unitError) {
          console.error(`Error processing unit ID ${unit.id} for date ${formattedDate}:`, unitError.message);
        }
      }
    }

    console.log('Slots for the next 7 days added successfully.');
  } catch (error) {
    console.error('Error adding slots for the next 7 days:', error.message);
    throw new Error('Failed to add slots for the next 7 days.');
  }
}


/**
 * Retrieves available slots from the cache. If the cache is expired or empty, it fetches the slots from the database
 * and updates the cache.
 * 
 * @async
 * @function getCachedAvailableSlots
 * @returns {Promise<Array>} Resolves to an array of available slots, including associated unit names.
 * @throws {Error} Throws an error if database fetching fails.
 */
async function getCachedAvailableSlots() {
  try {
    const cachedSlots = slotCache.get('available-slots'); // Check cache

    if (cachedSlots) {
      return cachedSlots; // Return cached slots if available
    }

    // Query to fetch slots and their associated unit names from the database
    const query = `
      SELECT slots.*, units.name AS unit_name
      FROM slots
      JOIN units ON slots.unit_id = units.id;
    `;

    const result = await pool.query(query); // Execute query
    slotCache.set('available-slots', result.rows); // Update cache
    return result.rows;
  } catch (error) {
    console.error('Error fetching cached available slots:', error.message); 
    throw new Error('Failed to fetch available slots'); 
  }
}

/**
 * Removes outdated slots and duplicates from the database.
 * Deletes slots older than the current date or beyond the next seven days, and removes duplicate slots.
 * 
 * @async
 * @function cleanUpExcessSlots
 * @returns {Promise<void>} Resolves when the cleanup is complete.
 * @throws {Error} Logs any error that occurs during the cleanup process.
 */
async function cleanUpExcessSlots() {
  try {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; // Format today's date as YYYY-MM-DD

    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7); // Increment 7 days
    const formattedSevenDaysFromNow = sevenDaysFromNow.toISOString().split('T')[0];

    // Delete slots older than today or beyond the next 7 days
    await pool.query(
      'DELETE FROM slots WHERE date < $1 OR date > $2',
      [formattedToday, formattedSevenDaysFromNow]
    );

    // Remove duplicate slots based on date, time, and unit_id
    await pool.query(`
      DELETE FROM slots
      WHERE ctid NOT IN (
        SELECT MIN(ctid)
        FROM slots
        GROUP BY date, time, unit_id
      );
    `);

    console.log('Old and duplicate slots cleaned up successfully.');
  } catch (error) {
    console.error('Error cleaning up slots:', error); 
  }
}

module.exports = {
  slotCache, 
  addSlotsForNextSevenDays, 
  cleanUpExcessSlots, 
  getCachedAvailableSlots, 
};
