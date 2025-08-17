import Image from 'next/image';
import Link from 'next/link';
import { AnimatedElement, useEnhancedAnimations } from '@/components/EnhancedAnimations';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'Learn about Void Esports - our mission, values, and commitment to excellence in competitive gaming.',
};

const values = [
  {
    title: 'Excellence',
    description: 'We pursue excellence relentlessly—in game and real life—delivering peak performance, professional conduct, and meaningful engagement with our amazing community.',
  },
  {
    title: 'Innovation',
    description: 'We push our players to higher standards and help them become the best versions of themselves.',
  },
  {
    title: 'Community',
    description: 'We are more than a team—we are a family. We uplift our players, community, and anyone we work with by creating a supportive and inclusive environment that values connection.',
  },
  {
    title: 'Integrity',
    description: 'We operate with honesty, fairness, and respect. We have a 0 tolerance policy for cheating in any of our events and in games. We hope that all will follow suit.',
  },
];

const achievements = [
  'Sign 2 more Fortnite professionals',
  'Have a player compete in FNCS Grand Finals',
  'Have a player compete at a LAN event',
  'Grow our Valorant team',
  'Win a Valorant Tournament',
];

export default function AboutPage() {
  // Initialize enhanced animations
  useEnhancedAnimations();

  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F] page-wrapper gpu-accelerated">
      <div className="void-container py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <AnimatedElement animation="bounceIn" delay={200}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">About Void</h1>
          </AnimatedElement>
          <AnimatedElement animation="slideInUp" delay={400}>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            A professional esports organization dedicated to excellence, innovation, and community building in competitive gaming.
          </p>
          </AnimatedElement>
        </div>

        {/* Mission Statement */}
        <AnimatedElement animation="scaleIn" delay={600}>
          <div className="void-card mb-16 hover-lift gpu-accelerated">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="relative h-64 md:h-full min-h-[300px] rounded-lg overflow-hidden">
              <Image
                src="/logo.png"
                alt="Void Esports Mission"
                fill
                className="object-cover transition-transform duration-500 hover:scale-110 gpu-accelerated"
              />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold gradient-text">Our Mission</h2>
              <p className="text-gray-300">
                At Void, we are driven to redefine the standards of excellence in esports. Our mission is to find new talent, improve it,  and lead them to success . With that we will create content and cultivate a thriving community that celebrates success in gaming.
              </p>
              <p className="text-gray-300">
                Through experience, coaching and practice we will lead our players to success and give them their best possible opportunity to win major events in the near future
              </p>
            </div>
          </div>
          </div>
        </AnimatedElement>

        {/* Core Values */}
        <div className="mb-16">
          <AnimatedElement animation="slideInUp" delay={800}>
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Our Values</h2>
          </AnimatedElement>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <AnimatedElement key={value.title} animation="scaleIn" delay={1000 + index * 150}>
                <div className="void-card hover-lift gpu-accelerated">
                <h3 className="text-xl font-bold mb-3 text-white">{value.title}</h3>
                <p className="text-gray-400">{value.description}</p>
                </div>
              </AnimatedElement>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <AnimatedElement animation="slideInUp" delay={1400}>
          <div className="void-card hover-lift gpu-accelerated">
            <h2 className="text-3xl font-bold mb-8 gradient-text">Our Goals</h2>
          <ul className="grid gap-4">
            {achievements.map((achievement, index) => (
              <li key={achievement} className="flex items-center gap-3 text-gray-300">
                <span className="h-2 w-2 rounded-full bg-[#a2a2a2] animate-pulse" />
                {achievement}
              </li>
            ))}
          </ul>
          </div>
        </AnimatedElement>

        {/* CTA Section */}
        <AnimatedElement animation="scaleIn" delay={1600}>
          <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-6 text-white">Join the Void Community</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teams" className="void-button hover-lift">
              View Our Teams
            </Link>
            <Link href="/contact" className="void-button bg-transparent border-2 text-[#FFFFFF] border-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000] hover-lift">
              Contact Us
            </Link>
          </div>
          </div>
        </AnimatedElement>
      </div>
    </div>
  );
} 