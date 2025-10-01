/**
 * Data Migration Script
 * Run this once to migrate all hardcoded data to Firestore
 * Usage: node -r ts-node/register src/scripts/migrateData.ts
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDqaPyYEv7PE34Njb1w8VFXdeU8UulCXmw",
  authDomain: "transcend-application-bot.firebaseapp.com",
  projectId: "transcend-application-bot",
  storageBucket: "transcend-application-bot.firebasestorage.app",
  messagingSenderId: "748353091728",
  appId: "1:748353091728:web:af973e8bec34c81f2e8015"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// News Articles Data
const newsArticles = [
  {
    title: 'Void Announces 1v1 Map Challenge Giveaway',
    image: '/news/wavedashh.png',
    description: 'Along with our new map we are doing another giveaway! Spend at least 30 minutes in our 1v1 map, then post on twitter with proof of you doing so! Then use #void1v1challenge and tag us! For every 30 minutes you get another entry into the giveaway! You can get unlimited entries so get to playing today! Giveaway ends on Saturday, August 23rd.',
    category: 'Fortnite',
    date: Timestamp.fromDate(new Date('2025-08-18'))
  },
  {
    title: 'Void Announces Fortnite Battle Pass Giveaway',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our Fortnite Battle Pass giveaway. For more information scroll down to the bottom of this page and join our discord.',
    category: 'Fortnite',
    date: Timestamp.fromDate(new Date('2025-08-05'))
  },
  {
    title: 'Void Earns in FNCS Grand Finals',
    image: '/news/FNCS.png',
    description: 'We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.',
    category: 'Fortnite',
    date: Timestamp.fromDate(new Date('2025-08-03'))
  },
  {
    title: 'Void Blu, Void Drvzy, and Void Fx1ine Qualify to FNCS Grand Finals',
    image: '/news/FNCS.png',
    description: 'We are excited to announce that three of our signings, Blue, Drvzy, and Fx1ine, qualified to FNCS Major 3 Grand Finals! We really wish them the best of luck in winning and qualifying to the FNCS Global Championships in France!',
    category: 'Fortnite',
    date: Timestamp.fromDate(new Date('2025-07-20'))
  },
  {
    title: 'Void Announces Two New Signing',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our new signings for our Fortnite team, Blu and Drvzy!',
    category: 'Fortnite',
    date: Timestamp.fromDate(new Date('2025-07-19'))
  },
  {
    title: 'Community Update: Summer Events',
    image: '/news/wavedashh.png',
    description: 'We hosted several community scrims and giveaways this summer. Thanks to everyone who participated—more events coming soon!',
    category: 'Community',
    date: Timestamp.fromDate(new Date('2025-06-01'))
  },
  {
    title: 'Void Updates Assets',
    image: '/logo.png',
    description: 'Void Esports has updated its branding assets, including a new logo and team colors. Check out our updated look!',
    category: 'Organization',
    date: Timestamp.fromDate(new Date('2025-06-01'))
  },
  {
    title: 'Void Website Released',
    image: '/logo.png',
    description: 'We are excited to announce the launch of our new website, designed to provide a better experience for our fans and community.',
    category: 'Organization',
    date: Timestamp.fromDate(new Date('2025-06-01'))
  }
];

// Teams Data
const teams = [
  {
    name: 'Fortnite',
    image: '/teams/fortnite.png',
    description: 'Our elite Fortnite squad competing at the highest level.',
    achievements: ['2x FNCS Grand Finals', '200K+ PR', '5k+ Earnings'],
    players: [
      {
        name: 'Void Blu',
        role: 'Player',
        image: '/teams/players/blu.png',
        game: 'Fortnite',
        achievements: ['FNCS Grand Finals', '2500+ Earnings', 'Top 10 Placement'],
        socialLinks: {
          twitter: 'https://x.com/D1_Blu',
          twitch: 'https://www.twitch.tv/d1blu'
        }
      },
      {
        name: 'Void Drvzy',
        role: 'Player',
        image: '/teams/players/drvzy.jpg',
        game: 'Fortnite',
        achievements: ['FNCS Grand Finals', 'Major 3 Qualifier', 'Elite Player'],
        socialLinks: {
          twitter: 'https://x.com/drvzyfn'
        }
      },
      {
        name: 'Void Jayse1x',
        role: 'Player',
        image: '/teams/players/jayse.jpg',
        game: 'Fortnite',
        achievements: ['Rising Star', 'Tournament Player', 'Future Champion'],
        socialLinks: {
          twitter: 'https://x.com/Jaysekbm'
        }
      },
      {
        name: 'Void Golden',
        role: 'Player',
        image: '/teams/players/1xGolden.jpg',
        game: 'Fortnite',
        achievements: ['100k+ PR', '11K+ earned', 'Future Champion'],
        socialLinks: {
          twitter: 'https://x.com/1xgolden'
        }
      }
    ],
    createdAt: Timestamp.fromDate(new Date('2025-07-01'))
  },
  {
    name: 'Ownership',
    image: '/logo.png',
    description: 'Void Esports Ownership Team',
    achievements: ['The Owners of Void Esports'],
    players: [
      {
        name: 'Frankenstein',
        role: 'Founder',
        image: '/teams/players/frank.png',
        game: 'Management',
        achievements: ['Founder', 'Team Management', 'Business Development'],
        socialLinks: {
          twitter: 'https://x.com/VoidFrankenste1',
          twitch: 'https://www.twitch.tv/voidfrankenstein'
        }
      },
      {
        name: 'Gruun',
        role: 'Founder',
        image: '/teams/players/gruun.png',
        game: 'Management',
        achievements: ['Founder', 'Developer', 'Technical Director'],
        socialLinks: {
          twitter: 'https://x.com/gruunvfx'
        }
      },
      {
        name: 'Dixuez',
        role: 'Ownership',
        image: '/teams/players/dix.png',
        game: 'Management',
        achievements: ['Team Manager', 'Infrastructure', 'Innovation'],
        socialLinks: {
          twitch: 'https://www.twitch.tv/dixuez'
        }
      },
      {
        name: 'Jah',
        role: 'CFO',
        image: '/logo.png',
        game: 'Management',
        achievements: ['Financial Director', 'Sponsorship', 'Growth Strategy'],
        socialLinks: {
          twitter: 'https://twitter.com/voiddrpuffin'
        }
      },
      {
        name: 'Nick',
        role: 'CEO',
        image: '/teams/players/nick.png',
        game: 'Management',
        achievements: ['Innovation', 'Community Manager', 'Manager'],
        socialLinks: {
          twitter: 'https://x.com/void_nicholas'
        }
      }
    ],
    createdAt: Timestamp.fromDate(new Date('2025-07-01'))
  }
];

// Products Data
const products = [
  {
    name: 'FREE Test Product',
    price: 0.00,
    image: '/store/sticker.png',
    category: 'Test',
    description: 'Free test product for testing checkout functionality. No payment required.',
    link: '#',
    createdAt: Timestamp.now()
  },
  {
    name: 'VOID Esports Premium Jersey',
    price: 55.00,
    image: '/store/jersey.png',
    category: 'Apparel',
    description: 'Official Void team jersey with premium quality fabric and player customization options.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-premium-jersey',
    createdAt: Timestamp.now()
  },
  {
    name: 'Void Hoodie',
    price: 49.50,
    image: '/store/hoodie.png',
    category: 'Apparel',
    description: 'Premium cotton blend hoodie with embroidered Void logo.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-hoodie',
    createdAt: Timestamp.now()
  },
  {
    name: 'Void Hoodie (White Logo)',
    price: 35.00,
    image: '/store/hoodie2.png',
    category: 'Apparel',
    description: 'Premium cotton blend hoodie with embroidered white Void logo.',
    link: 'https://evo9x.gg/collections/void-esports/products/void-esports-unisex-hoodie',
    createdAt: Timestamp.now()
  },
  {
    name: 'Void Cobra Hoodie',
    price: 40.99,
    image: '/store/CobraHoodie.png',
    category: 'Apparel',
    description: 'Premium cotton blend hoodie with embroidered Cobra branding with Void logo.',
    link: 'https://voidgamingshop.creator-spring.com/listing/void-cobra-custom-set?product=212&variation=5819',
    createdAt: Timestamp.now()
  }
];

// Matches Data
const matches = [
  {
    game: 'TBD',
    event: 'TBD',
    opponent: 'TBD',
    date: 'TBD',
    time: 'TBD',
    streamLink: 'https://www.twitch.tv/voidfrankenstein',
    createdAt: Timestamp.now()
  }
];

// Events Data
const events = [
  {
    name: 'Void Summer Showdown',
    game: 'Fortnite',
    date: 'TBD',
    type: 'Online Tournament',
    prizePool: 'TBD (USD)',
    registrationLink: 'https://discord.gg/voidesports2x',
    createdAt: Timestamp.now()
  }
];

async function migrateData() {
  console.log('🚀 Starting data migration...\n');

  try {
    // Migrate News Articles
    console.log('📰 Migrating news articles...');
    for (const article of newsArticles) {
      await addDoc(collection(db, 'newsArticles'), article);
      console.log(`  ✅ Added: ${article.title}`);
    }

    // Migrate Teams
    console.log('\n👥 Migrating teams...');
    for (const team of teams) {
      await addDoc(collection(db, 'teams'), team);
      console.log(`  ✅ Added: ${team.name}`);
    }

    // Migrate Products
    console.log('\n🛍️  Migrating products...');
    for (const product of products) {
      await addDoc(collection(db, 'products'), product);
      console.log(`  ✅ Added: ${product.name}`);
    }

    // Migrate Matches
    console.log('\n⚔️  Migrating matches...');
    for (const match of matches) {
      await addDoc(collection(db, 'matches'), match);
      console.log(`  ✅ Added: ${match.game} vs ${match.opponent}`);
    }

    // Migrate Events
    console.log('\n🎉 Migrating events...');
    for (const event of events) {
      await addDoc(collection(db, 'events'), event);
      console.log(`  ✅ Added: ${event.name}`);
    }

    console.log('\n✨ Migration completed successfully!');
    console.log('You can now remove the fallback data from your services.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
}

// Run migration
migrateData();
