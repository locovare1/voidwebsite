"use client";

import React from 'react';

interface BadgeProps {
	children: React.ReactNode;
	color?: 'gold' | 'silver' | 'bronze' | 'green' | 'default';
	className?: string;
}

const colorClassMap: Record<NonNullable<BadgeProps['color']>, string> = {
	gold: 'text-[#FFD700] bg-white/10',
	silver: 'text-[#C0C0C0] bg-white/10',
	bronze: 'text-[#CD7F32] bg-white/10',
	green: 'text-[#4CAF50] bg-white/10',
	default: 'text-white bg-white/10',
};

export default function Badge({ children, color = 'default', className = '' }: BadgeProps) {
	const colorClasses = colorClassMap[color] ?? colorClassMap.default;
	return (
		<span className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-sm font-semibold ${colorClasses} ${className}`}>
			{children}
		</span>
	);
}


