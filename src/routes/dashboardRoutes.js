const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Event = require('../models/Event');
const TVShow = require('../models/TVShow');
const User = require('../models/User');
const { auth, adminAuth } = require('../middleware/auth');
const moment = require('moment');

// Get dashboard stats
router.get('/stats', auth, adminAuth, async (req, res) => {
    try {
        const currentDate = new Date();
        
        // Get total bookings
        const totalBookings = await Booking.countDocuments({});

        // Get active events (happening today or in the future)
        const activeEvents = await Event.countDocuments({
            date: { $gte: currentDate }
        });

        // Get total TV shows
        const totalShows = await TVShow.countDocuments({ isLive: true });

        // Get current guests (checked in but not checked out)
        const currentGuests = await Booking.countDocuments({ 
            status: 'confirmed',
            checkInDate: { $lte: currentDate },
            checkOutDate: { $gt: currentDate }
        });

        res.json({
            totalBookings,
            activeEvents,
            totalShows,
            currentGuests
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Error fetching dashboard stats' });
    }
});

// Get booking trends
router.get('/booking-trends/:period', auth, adminAuth, async (req, res) => {
    try {
        const { period } = req.params;
        let startDate, groupBy, format;

        switch (period) {
            case 'week':
                startDate = moment().subtract(7, 'days').startOf('day');
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                format = 'YYYY-MM-DD';
                break;
            case 'month':
                startDate = moment().subtract(30, 'days').startOf('day');
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                format = 'YYYY-MM-DD';
                break;
            case 'year':
                startDate = moment().subtract(12, 'months').startOf('month');
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                format = 'YYYY-MM';
                break;
            default:
                return res.status(400).json({ error: 'Invalid period' });
        }

        const bookings = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate.toDate() }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    count: { $sum: 1 },
                    revenue: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Fill in missing dates with zero values
        const filledData = [];
        let currentDate = startDate.clone();
        const endDate = moment();

        while (currentDate.isSameOrBefore(endDate, period === 'year' ? 'month' : 'day')) {
            const dateStr = currentDate.format(format);
            const existingData = bookings.find(b => b._id === dateStr);
            
            filledData.push({
                date: dateStr,
                bookings: existingData ? existingData.count : 0,
                revenue: existingData ? existingData.revenue : 0
            });

            currentDate.add(1, period === 'year' ? 'month' : 'day');
        }

        res.json(filledData);
    } catch (error) {
        console.error('Error fetching booking trends:', error);
        res.status(500).json({ error: 'Error fetching booking trends' });
    }
});

// Get recent activities
router.get('/recent-activities', auth, adminAuth, async (req, res) => {
    try {
        // Get recent bookings
        const recentBookings = await Booking.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('service date time status createdAt')
            .lean();

        // Get recent events
        const recentEvents = await Event.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title date time category createdAt')
            .lean();

        // Combine and format activities
        const activities = [
            ...recentBookings.map(booking => ({
                type: 'booking',
                time: booking.createdAt,
                description: `New booking for ${booking.service} on ${moment(booking.date).format('MMM DD, YYYY')} at ${booking.time}`,
                status: booking.status
            })),
            ...recentEvents.map(event => ({
                type: 'event',
                time: event.createdAt,
                description: `New ${event.category} event: ${event.title} on ${moment(event.date).format('MMM DD, YYYY')} at ${event.time}`,
                status: 'active'
            }))
        ];

        // Sort by time descending and limit to 10
        const sortedActivities = activities
            .sort((a, b) => b.time - a.time)
            .slice(0, 10);

        res.json(sortedActivities);
    } catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({ error: 'Error fetching recent activities' });
    }
});

// Get revenue data
router.get('/revenue/:period', auth, adminAuth, async (req, res) => {
    try {
        const { period } = req.params;
        let startDate, groupBy, format;

        switch (period) {
            case 'week':
                startDate = moment().subtract(7, 'days').startOf('day');
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                format = 'YYYY-MM-DD';
                break;
            case 'month':
                startDate = moment().subtract(30, 'days').startOf('day');
                groupBy = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
                format = 'YYYY-MM-DD';
                break;
            case 'year':
                startDate = moment().subtract(12, 'months').startOf('month');
                groupBy = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
                format = 'YYYY-MM';
                break;
            default:
                return res.status(400).json({ error: 'Invalid period' });
        }

        const revenue = await Booking.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate.toDate() },
                    status: { $in: ['confirmed', 'completed'] }
                }
            },
            {
                $group: {
                    _id: groupBy,
                    total: { $sum: '$totalAmount' }
                }
            },
            {
                $sort: { '_id': 1 }
            }
        ]);

        // Fill in missing dates with zero values
        const filledData = [];
        let currentDate = startDate.clone();
        const endDate = moment();

        while (currentDate.isSameOrBefore(endDate, period === 'year' ? 'month' : 'day')) {
            const dateStr = currentDate.format(format);
            const existingData = revenue.find(r => r._id === dateStr);
            
            filledData.push({
                date: dateStr,
                revenue: existingData ? existingData.total : 0
            });

            currentDate.add(1, period === 'year' ? 'month' : 'day');
        }

        res.json(filledData);
    } catch (error) {
        console.error('Error fetching revenue data:', error);
        res.status(500).json({ error: 'Error fetching revenue data' });
    }
});

module.exports = router;