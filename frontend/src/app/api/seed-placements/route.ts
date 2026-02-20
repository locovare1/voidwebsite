import { NextRequest, NextResponse } from 'next/server';
import { seedPlacements } from '@/lib/seedPlacements';

export async function POST(request: NextRequest) {
  try {
    console.log('Seeding placements via API endpoint...');
    await seedPlacements();
    return NextResponse.json({ success: true, message: 'Placements seeded successfully!' });
  } catch (error) {
    console.error('Error seeding placements:', error);
    return NextResponse.json({ success: false, error: 'Failed to seed placements' }, { status: 500 });
  }
}