import Image from 'next/image';

const newsArticles = [
  {
    title: 'Void Earns in FNCS Grand Finals',
    date: '2025-07-20',
    image: '/news/FNCS.png',
    description: 'We are proud to say that Void Blu went crazy in FNCS Grands and earned over 2500 dollars split across his trio. We want to wish Blu good luck in the next FNCS and we are very proud of him.',
    category: 'Fortnite',
  },
  {
    title: 'Void Blu and Void Drvzy Qualify to FNCS Grand Finals',
    date: '2025-07-20',
    image: '/news/FNCS.png',
    description: 'We are excited to announce that Both of our signings, Blue and Drvzy, qualified to FNCS Major 3 Grand Finals! We really wish them the best of luck in winning and qualifying to the FNCS Global Championships in France!',
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
    title: 'Void Announces Upcoming Valorant Team',
    date: '2025-06-01',
    image: '/teams/valorant.png',
    description: 'We are thrilled to announce our new Valorant team, featuring some of the most talented players in the region. Get ready for an exciting season ahead!',
    category: 'Valorant',
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
        <h1 className="text-4xl font-bold mb-12 gradient-text text-center">Latest News</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsArticles.map((article) => (
            <div key={article.title} className="void-card group cursor-pointer">
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
                
                <p className="text-gray-400 line-clamp-3">
                  {article.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
