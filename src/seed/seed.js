const mongoose = require('mongoose');
const Event = require('../models/Event');
const TVShow = require('../models/TVShow');
require('dotenv').config();

const events = [
  {
    title: 'Wine Tasting Evening',
    date: '2024-12-27',
    time: '19:00',
    location: 'Wine Cellar',
    description: 'Experience our finest wine selection with our sommelier.',
    category: 'Culinary',
    imageUrl: 'https://www.wienscellars.com/wp-content/uploads/2024/06/960x0-1.jpg',
    spots: 12,
    spotsRemaining: 12,
  },
  {
    title: 'Live Jazz Performance',
    date: '2024-12-27',
    time: '20:30',
    location: 'Lobby Lounge',
    description: 'Enjoy an evening of smooth jazz with our resident band.',
    category: 'Entertainment',
    imageUrl: 'https://jazzbistro.ca/wp-content/uploads/2023/09/Jazz-musicians-performing-live.jpg',
    spots: 50,
    spotsRemaining: 50,
  },
  {
    title: 'Gourmet Cooking Class',
    date: '2024-12-28',
    time: '11:00',
    location: 'Main Kitchen',
    description: 'Learn to cook signature dishes with our executive chef.',
    category: 'Culinary',
    imageUrl: 'https://www.niseko-gourmet.com/media/cookingschool/COOKBOOK_02.jpg',
    spots: 8,
    spotsRemaining: 8,
  },
  {
    title: 'Yoga by the Pool',
    date: '2024-12-28',
    time: '07:00',
    location: 'Pool Deck',
    description: 'Start your day with a rejuvenating yoga session.',
    category: 'Wellness',
    imageUrl: 'https://t3.ftcdn.net/jpg/05/09/62/22/360_F_509622202_JFYM9Y5Jy5mW8wpyt6mW3boTGU0ySgmf.jpg',
    spots: 15,
    spotsRemaining: 15,
  }
];

const tvShows = [
  {
    name: 'Essaida TV',
    category: 'Entertainment',
    url: 'https://essaidatv.dextream.com/hls/stream/index.m3u8',
    description: 'Tunisian entertainment channel featuring local content',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/8/8e/Logo_essaida.png',
    isLive: true,
  },
  {
    name: 'JAWHARA TV',
    category: 'Entertainment',
    url: 'https://streaming.toutech.net/live/jtv/index.m3u8',
    description: 'Live entertainment and cultural programming [720p]',
    thumbnail: 'https://www.jawharafm.net/ar/static/fr/image/jpg/logo-jawhara.jpg',
    isLive: true,
  },
  {
    name: 'Mosaïque FM',
    category: 'News',
    url: 'https://webcam.mosaiquefm.net:1936/mosatv/studio/playlist.m3u8',
    description: 'News and current affairs from Tunisia [480p]',
    thumbnail: 'https://www.mosaiquefm.net/images/front2020/logoMosaique.png',
    isLive: true,
  },
  {
    name: 'Nessma',
    category: 'General',
    url: 'https://shls-live-ak.akamaized.net/out/v1/119ae95bbc91462093918a7c6ba11415/index.m3u8',
    description: 'General entertainment and news channel [1080p]',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/7/76/Logo_nessma.png',
    isLive: true,
  },
  {
    name: 'Sahel TV',
    category: 'Regional',
    url: 'http://142.44.214.231:1935/saheltv/myStream/playlist.m3u8',
    description: 'Regional television channel from Tunisia [720p]',
    thumbnail: 'https://saheltv.tn/wp-content/uploads/2018/01/saheltv_logo.png',
    isLive: true,
  },
  {
    name: 'Tunisie Immobilier TV',
    category: 'Business',
    url: 'https://5ac31d8a4c9af.streamlock.net/tunimmob/myStream/playlist.m3u8',
    description: 'Real estate and property channel [720p]',
    thumbnail: 'https://tunisieimmobiliertv.net/wp-content/uploads/2019/03/logo-tv.png',
    isLive: true,
  },
  {
    name: 'Watania 1',
    category: 'National',
    url: 'http://live.watania1.tn:1935/live/watanya1.stream/playlist.m3u8',
    description: 'National public television channel [576p]',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/6/65/Watania1.png',
    isLive: true,
  },
  {
    name: 'Watania 2',
    category: 'National',
    url: 'http://live.watania2.tn:1935/live/watanya2.stream/playlist.m3u8',
    description: 'Second national public television channel [360p]',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/7/72/Logo_Watania2.png',
    isLive: true,
  },
  {
    name: 'Zitouna TV',
    category: 'Religious',
    url: 'https://video1.getstreamhosting.com:1936/8320/8320/playlist.m3u8',
    description: 'Religious and cultural programming [480p]',
    thumbnail: 'https://upload.wikimedia.org/wikipedia/fr/2/2c/Logo_zitouna.jpg',
    isLive: true,
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Event.deleteMany({});
    await TVShow.deleteMany({});
    console.log('Cleared existing data');

    // Seed events
    await Event.insertMany(events);
    console.log('Seeded events');

    // Seed TV shows
    await TVShow.insertMany(tvShows);
    console.log('Seeded TV shows');

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seedDatabase();
