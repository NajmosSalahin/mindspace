import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
dotenv.config();

import User from '../models/User.js';
import Event from '../models/Event.js';
import Category from '../models/Category.js';
import Coupon from '../models/Coupon.js';

const categories = [
  { name: 'Tech', slug: 'tech', icon: 'Monitor', description: 'Technology conferences & meetups', color: '#4F46E5' },
  { name: 'Music', slug: 'music', icon: 'Music', description: 'Concerts & music festivals', color: '#7C3AED' },
  { name: 'Sports', slug: 'sports', icon: 'Trophy', description: 'Sports events & tournaments', color: '#F59E0B' },
  { name: 'Business', slug: 'business', icon: 'Briefcase', description: 'Business networking & seminars', color: '#10B981' },
  { name: 'Education', slug: 'education', icon: 'BookOpen', description: 'Workshops & educational events', color: '#3B82F6' },
  { name: 'Gaming', slug: 'gaming', icon: 'Gamepad2', description: 'Gaming tournaments & meetups', color: '#EF4444' },
  { name: 'Workshop', slug: 'workshop', icon: 'Wrench', description: 'Hands-on workshops', color: '#F97316' },
  { name: 'Other', slug: 'other', icon: 'Calendar', description: 'Other events', color: '#6B7280' },
];

const cities = ['New York', 'San Francisco', 'London', 'Berlin', 'Tokyo', 'Sydney', 'Toronto', 'Mumbai'];
const venues = ['Convention Center', 'Grand Hall', 'Tech Hub', 'City Arena', 'Community Space', 'Innovation Lab'];
const addresses = ['123 Main St', '456 Park Ave', '789 Broadway', '321 Oak St', '654 Elm St'];

const eventNames = {
  Tech: ['AI Summit 2026', 'ReactConf', 'Cloud Native Day', 'DevOps World', 'Cybersecurity Forum', 'Data Science Expo', 'Mobile Dev Conference', 'Blockchain Summit'],
  Music: ['Summer Music Fest', 'Jazz Night', 'Electronic Beats', 'Rock Revolution', 'Classical Evening', 'Hip Hop Summit', 'Indie Music Showcase', 'DJ Night'],
  Sports: ['Marathon 2026', 'Basketball Championship', 'Yoga Retreat', 'Fitness Expo', 'Swimming Competition', 'Tennis Open', 'Boxing Night', 'Crossfit Games'],
  Business: ['Startup Pitch Fest', 'Business Leadership Summit', 'Networking Mixer', 'Investment Forum', 'Entrepreneurship Workshop', 'Marketing Conference', 'HR Summit', 'Finance Expo'],
  Education: ['Science Fair', 'Language Learning Workshop', 'Coding Bootcamp', 'History Lecture Series', 'Writing Workshop', 'Math Olympiad', 'Art History Class', 'Photography Workshop'],
  Gaming: ['Game Dev Conference', 'E-Sports Tournament', 'Retro Gaming Expo', 'VR Gaming Night', 'Speedrun Marathon', 'Indie Game Showcase', 'Board Game Night', 'Fighting Game Championship'],
  Workshop: ['Pottery Workshop', 'Cooking Class', 'Woodworking Workshop', 'Painting Workshop', 'Dance Workshop', 'Photography Workshop', 'Music Production', 'Sculpture Class'],
  Other: ['Comedy Night', 'Food Festival', 'Book Fair', 'Film Screening', 'Art Exhibition', 'Charity Gala', 'Fashion Show', 'Cultural Festival'],
};

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}),
      Event.deleteMany({}),
      Category.deleteMany({}),
      Coupon.deleteMany({}),
    ]);

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@eventsphere.com',
      password: 'password123',
      role: 'admin',
      isVerified: true,
    });
    console.log(`Admin created: ${admin.email}`);

    const organizers = [];
    const organizerNames = ['Alice Johnson', 'Bob Smith', 'Carol Williams', 'David Brown', 'Eve Davis', 'Frank Miller', 'Grace Wilson', 'Henry Moore', 'Ivy Taylor', 'Jack Anderson'];
    for (const name of organizerNames) {
      const email = `${name.toLowerCase().replace(' ', '.')}@eventsphere.com`;
      const org = await User.create({
        name, email, password: 'password123', role: 'organizer', isVerified: true,
        bio: `Experienced event organizer with a passion for creating memorable experiences.`,
      });
      organizers.push(org);
    }
    console.log(`${organizers.length} organizers created`);

    const users = [];
    const userNames = ['Kate Lee', 'Liam Wang', 'Mia Chen', 'Noah Kumar', 'Olivia Patel', 'Peter Kim', 'Quinn Singh', 'Rose Thompson', 'Sam Garcia', 'Tina Martinez'];
    for (const name of userNames) {
      const email = `${name.toLowerCase().replace(' ', '.')}@example.com`;
      const user = await User.create({ name, email, password: 'password123', role: 'user', isVerified: true });
      users.push(user);
    }
    console.log(`${users.length} users created`);

    await Category.create(categories);

    const events = [];
    for (let i = 0; i < 50; i++) {
      const org = organizers[i % organizers.length];
      const catKeys = Object.keys(eventNames);
      const category = catKeys[i % catKeys.length];
      const names = eventNames[category];
      const title = names[i % names.length];
      const city = cities[i % cities.length];
      const venue = venues[i % venues.length];
      const address = addresses[i % addresses.length];
      const eventDate = new Date();
      eventDate.setDate(eventDate.getDate() + (i % 60) + 1);
      const priceTiers = [
        { name: 'General', price: 0, quantity: 100 },
        { name: 'VIP', price: 49.99, quantity: 30 },
        { name: 'Premium', price: 99.99, quantity: 10 },
      ];
      const ticketTypes = priceTiers.map((t) => ({
        ...t,
        remaining: t.quantity,
        description: `${t.name} admission ticket`,
      }));
      const event = await Event.create({
        title: `${title} ${2026 + (i % 3)}`,
        description: `Join us for an amazing ${category.toLowerCase()} event! This is a premier gathering featuring industry experts, networking opportunities, and unforgettable experiences. Don't miss out on this incredible event in ${city}.`,
        category,
        organizerId: org._id,
        venue,
        address,
        city,
        country: 'United States',
        coordinates: { lat: 40.7128 + (Math.random() - 0.5) * 10, lng: -74.006 + (Math.random() - 0.5) * 10 },
        banner: '',
        tags: [category.toLowerCase(), city.toLowerCase(), '2026'],
        status: i < 5 ? 'draft' : 'published',
        date: eventDate,
        startTime: '09:00',
        endTime: '17:00',
        capacity: 200,
        ticketTypes,
        isFeatured: i < 6,
        viewCount: Math.floor(Math.random() * 5000),
      });
      events.push(event);
    }
    console.log(`${events.length} events created`);

    const coupons = [
      { code: 'WELCOME10', discountType: 'percent', discountValue: 10, maxUses: 100, usedCount: 0, expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) },
      { code: 'FLAT5', discountType: 'fixed', discountValue: 5, maxUses: 50, usedCount: 0, expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000) },
      { code: 'VIP20', discountType: 'percent', discountValue: 20, maxUses: 25, usedCount: 0, expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
    ];
    await Coupon.create(coupons);
    console.log(`${coupons.length} coupons created`);

    console.log('\n--- Seed Complete ---');
    console.log('Admin: admin@eventsphere.com / password123');
    console.log('Organizers: e.g., alice.johnson@eventsphere.com / password123');
    console.log('Users: e.g., kate.lee@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();
