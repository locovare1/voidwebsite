import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';

const newsArticles = [
  {
    title: 'Void Announces 1v1 Map Challenge Giveaway',
    date: '2025-08-18',
    image: '/news/wavedashh.png',
    description: 'Along with our new map we are doing another giveaway! Spend at least 30 minutes in our 1v1 map, then post on twitter with proof of you doing so! Then use #void1v1challenge and tag us! For every 30 minutes you get another entry into the giveaway! You can get unlimited entries so get to playing today! Giveaway ends on Saturday, August 23rd.',
    category: 'Fortnite',
  },
  {
    title: 'Void Announces Fortnite Battle Pass Giveaway',
    date: '2025-08-5',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our Fortnite Battle Pass giveaway. For more information scroll down to the bottom of this page and join our discord.',
    category: 'Fortnite',
  },
  {
    title: 'Void Earns in FNCS Grand Finals',
    date: '2025-08-3',
    image: '/news/FNCS.png',
    description: 'We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.',
    category: 'Fortnite',
  },
  {
    title: 'Void Blu, Void Drvzy, and Void Fx1ine Qualify to FNCS Grand Finals',
    date: '2025-07-20',
    image: '/news/FNCS.png',
    description: 'We are excited to announce that three of our signings, Blue, Drvzy, and Fx1ine, qualified to FNCS Major 3 Grand Finals! We really wish them the best of luck in winning and qualifying to the FNCS Global Championships in France!',
    category: 'Fortnite',
  },
  {
    title: 'Void Announces Two New Signing',
    date: '2025-07-19',
    image: '/news/wavedashh.png',
    description: 'We are thrilled to announce our new signings for our Fortnite team, Blu and Drvzy!',
    category: 'Fortnite',
  },
  {
    title: 'Community Update: Summer Events',
    date: '2025-06-01',
    image: '/news/wavedashh.png',
    description: 'We hosted several community scrims and giveaways this summer. Thanks to everyone who participated—more events coming soon!',
    category: 'Community',
  },
  {
    title: 'Void Updates Assets',
    date: '2025-06-01',
    image: '/logo.png',
    description: 'Void Esports has updated its branding assets, including a new logo and team colors. Check out our updated look!',
    category: 'Organization',
  },
  {
    title: 'Void Website Released',
    date: '2025-06-01',
    image: '/logo.png',
    description: 'We are excited to announce the launch of our new website, designed to provide a better experience for our fans and community.',
    category: 'Organization',
  },
];

export default function NewsPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="void-container py-12">
        <AnimatedSection animationType="fadeIn" delay={100}>
          <h1 className="text-4xl font-bold mb-12 gradient-text text-center">Latest News</h1>
        </AnimatedSection>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article, index) => (
            <AnimatedSection key={article.title} animationType="slideUp" delay={index * 100}>
              <div className="void-card group cursor-pointer transition-transform duration-300 hover:-translate-y-1">
                <div className="relative h-48 mb-4 overflow-hidden rounded-lg">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transform group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>{article.date}</span>
                    <span className="px-2 py-1 bg-[#FFFFFF]/20 rounded-full text-[#FFFFFF]">
                      {article.category}
                    </span>
                  </div>
                  
                  <h2 className="text-xl font-bold group-hover:text-[#a2a2a2] transition-colors">
                    {article.title}
                  </h2>
                  
                  <p className="text-gray-400">
                    {article.description}
                  </p>
                </div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </div>
  );
}
