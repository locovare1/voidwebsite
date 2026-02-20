import { type Player } from '@/lib/teamService';

export type DisplayTeam = {
    id?: string;
    name: string;
    image: string;
    description: string;
    players: Player[];
    achievements: string[];
};

export const fallbackTeams: DisplayTeam[] = [
    {
        name: 'Fortnite',
        image: '/teams/fortnite.png',
        description: 'Our elite Fortnite squad competing at the highest level.',
        players: [
            {
                name: 'Void Blu',
                role: 'Player',
                image: '/teams/players/blu.png',
                game: 'Fortnite',
                description: 'A highly skilled Fortnite competitor known for aggressive playstyle and strategic rotations. Blu has been a dominant force in the competitive scene.',
                stats: [
                    { label: 'Earnings', value: '$2,500+' },
                    { label: 'PR', value: '50k+' },
                    { label: 'Win Rate', value: '15%' }
                ],
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
                description: 'Consistent and mechanical, Drvzy brings a level of precision to the team that is unmatched. Known for clutch plays in high-pressure situations.',
                stats: [
                    { label: 'Earnings', value: '$1,000+' },
                    { label: 'PR', value: '30k+' },
                    { label: 'K/D', value: '4.5' }
                ],
                achievements: ['FNCS Grand Finals', 'Major 3 Qualifier', 'Elite Player'],
                socialLinks: {
                    twitter: 'https://x.com/drvzyfn',
                }
            },
            {
                name: 'Void Jayse1x',
                role: 'Player',
                image: '/teams/players/jayse.jpg',
                game: 'Fortnite',
                description: 'A rising star in the Fortnite community. Jayse combines raw mechanical talent with a deep understanding of the meta.',
                stats: [
                    { label: 'Earnings', value: '$500+' },
                    { label: 'PR', value: '15k+' },
                    { label: 'Avg Place', value: '#12' }
                ],
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
                description: 'With over 100k PR, Golden is a veteran of the scene. His experience and leadership are vital to the team\'s success.',
                stats: [
                    { label: 'Earnings', value: '$11,000+' },
                    { label: 'PR', value: '100k+' },
                    { label: 'Wins', value: '500+' }
                ],
                achievements: ['100k+ PR', '11K+ earned', 'Future Champion'],
                socialLinks: {
                    twitter: 'https://x.com/1xgolden'
                }
            }
        ],
        achievements: ['2x FNCS Grand Finals', '200K+ PR', '5k+ Earnings'],
    },
    {
        name: 'Ownership',
        image: '/logo.png',
        description: 'Void Esports Ownership Team',
        players: [
            {
                name: 'Frankenstein',
                role: 'Founder',
                image: '/teams/players/frank.png',
                game: 'Management',
                description: 'The visionary behind Void Esports. Frankenstein oversees all operations and strategic direction of the organization.',
                stats: [
                    { label: 'Founded', value: '2020' },
                    { label: 'Role', value: 'Founder' }
                ],
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
                description: 'Technical Director and Co-Founder. Gruun ensures the organization stays ahead of the curve with technology and infrastructure.',
                stats: [
                    { label: 'Role', value: 'Tech Lead' },
                    { label: 'Exp', value: '5+ Years' }
                ],
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
                description: 'Managing the day-to-day operations and ensuring smooth execution of team activities.',
                stats: [
                    { label: 'Role', value: 'Manager' }
                ],
                achievements: ['Team Manager', 'Infrastructure', 'Innovation'],
                socialLinks: {
                    twitter: 'https://www.twitch.tv/dixuez'
                }
            },
            {
                name: 'Jah',
                role: 'CFO',
                image: '/logo.png',
                game: 'Management',
                description: 'Chief Financial Officer. Jah manages the financial health and sponsorship acquisitions for Void Esports.',
                stats: [
                    { label: 'Role', value: 'CFO' }
                ],
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
                description: 'Chief Executive Officer. Nick leads the community engagement and overall management of the organization.',
                stats: [
                    { label: 'Role', value: 'CEO' }
                ],
                achievements: ['Innovation', 'Community Manager', 'Manager'],
                socialLinks: {
                    twitter: 'https://x.com/void_nicholas'
                }
            },
        ],
        achievements: ['The Owners of Void Esports'],
    },
];
