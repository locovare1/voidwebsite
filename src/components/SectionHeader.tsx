"use client";

import React from 'react';

interface SectionHeaderProps {
	title: string;
	subtitle?: string;
	align?: 'left' | 'center';
	className?: string;
}

export default function SectionHeader({ title, subtitle, align = 'center', className = '' }: SectionHeaderProps) {
	return (
		<div className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
			<h1 className="text-3xl md:text-4xl font-extrabold tracking-tight gradient-text">
				{title}
			</h1>
			{subtitle && (
				<p className={`mt-3 text-gray-400 ${align === 'center' ? 'mx-auto' : ''} max-w-3xl`}>
					{subtitle}
				</p>
			)}
			<div className={`mt-5 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent ${align === 'center' ? 'mx-auto w-24' : 'w-24'}`} />
		</div>
	);
}


