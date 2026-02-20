import Image from 'next/image';
import AnimatedSection from '@/components/AnimatedSection';
import Link from 'next/link';
import AdPlaceholder from '@/components/AdPlaceholder';
import { AnimatedHeroSection, AnimatedCard, StaggeredList, StaggeredItem, ParallaxText, FadeInSection } from '@/components/FramerAnimations';

const values = [
  {
    title: 'Excellence',
    description: 'We pursue excellence relentlessly—in game and real life—delivering peak performance, professional conduct, and meaningful engagement with our amazing community.',
  },
  {
    title: 'Innovation',
    description: 'We push our players to higher standards and help them become the best versions of themselves on all fronts.',
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

export default function AboutPage() {
  return (
    <div className="pt-20 min-h-screen bg-[#0F0F0F]">
      <div className="void-container py-12">
        {/* Ad Spot - Banner at top */}
        <div className="mb-8">
          <AdPlaceholder size="banner" />
        </div>

        {/* Hero Section */}
        <AnimatedHeroSection>
          <div className="text-center mb-16">
            <ParallaxText speed={0.2}>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">About Void</h1>
            </ParallaxText>
            <FadeInSection>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              A professional esports organization shooting for excellence and innovation in all aspects of gaming. Void isn't a clan, we are the future.
              </p>
            </FadeInSection>
          </div>
        </AnimatedHeroSection>

        {/* Mission Statement */}
        <AnimatedSection animationType="slideUp" delay={150}>
          <div className="void-card mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="relative h-64 md:h-full min-h-[300px] rounded-lg overflow-hidden">
                <Image
                  src="/logos/new-logo.png"
                  alt="Void Esports Mission"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-bold gradient-text">Our Mission</h2>
                <p className="text-gray-300">
                  At Void, we are focused on redefining the standards in the esports industry. Our mission here is to find talent and give it the platform they need to shoot for the stars. We create Content to let every person view the excellence and community we have here at Void. Void holds pride in the community we have cultivated over the years and want all of you to experience it.
                </p>
                <p className="text-gray-300">
                  Through experience, coaching, and practice we lead our players into an environment to succeed on all fronts from competitive too content creation. Void doesn't just exist in a endless Void- we shoot through it like a hand chasing a shooting star. 
                </p>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Core Values */}
        <AnimatedSection animationType="fadeIn" delay={200}>
          <div className="mb-16">
            <h2 className="text-3xl font-bold mb-8 text-center gradient-text">Our Values</h2>
            <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <StaggeredItem key={value.title}>
                  <AnimatedCard delay={index * 0.05} className="void-card">
                    <h3 className="text-xl font-bold mb-3 text-white">{value.title}</h3>
                    <p className="text-gray-400">{value.description}</p>
                  </AnimatedCard>
                </StaggeredItem>
              ))}
            </StaggeredList>
          </div>
        </AnimatedSection>

        {/* Ad Spot - Banner before CTA */}
        <div className="mt-16 mb-8">
          <AdPlaceholder size="banner" />
        </div>

        {/* CTA Section */}
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-bold mb-6 text-white">Join the Void Community</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/teams" className="void-button">
              View Our Teams
            </Link>
            <Link href="/contact" className="void-button bg-transparent border-2 text-[#FFFFFF] border-[#FFFFFF] hover:bg-[#FFFFFF] hover:text-[#000000]">
              Contact Us
            </Link>
          </div>
        </div>

        {/* Ad Spot - Banner at bottom */}
        <div className="mt-16">
          <AdPlaceholder size="banner" />
        </div>
      </div>
    </div>
  );
} 