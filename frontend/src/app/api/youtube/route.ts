import { NextRequest, NextResponse } from 'next/server';

const YOUTUBE_BASE_URL = 'https://www.googleapis.com/youtube/v3';

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY || process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
    const channelId = process.env.YOUTUBE_CHANNEL_ID || process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID;

    if (!apiKey || !channelId) {
      return NextResponse.json({ error: 'YouTube service is not configured' }, { status: 500 });
    }

    const searchParams = request.nextUrl.searchParams;
    const maxResults = Number(searchParams.get('maxResults') || '10');
    const mode = searchParams.get('mode') || 'latest';
    const query = searchParams.get('query') || '';

    if (mode === 'search') {
      const searchUrl = `${YOUTUBE_BASE_URL}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${apiKey}`;
      const searchResponse = await fetch(searchUrl, { cache: 'no-store' });
      if (!searchResponse.ok) {
        return NextResponse.json({ error: 'Failed to search videos' }, { status: 502 });
      }
      const searchData = await searchResponse.json();
      const videoIds = (searchData.items || []).map((item: any) => item.id?.videoId).filter(Boolean).join(',');
      if (!videoIds) return NextResponse.json({ items: [] });

      const videosResponse = await fetch(
        `${YOUTUBE_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
        { cache: 'no-store' }
      );
      if (!videosResponse.ok) {
        return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 502 });
      }
      const videosData = await videosResponse.json();
      return NextResponse.json({ items: videosData.items || [] });
    }

    const identifierParam = channelId.startsWith('UC')
      ? `id=${channelId}`
      : `forHandle=${encodeURIComponent(channelId.startsWith('@') ? channelId.substring(1) : channelId)}`;

    const channelResponse = await fetch(
      `${YOUTUBE_BASE_URL}/channels?part=contentDetails&${identifierParam}&key=${apiKey}`,
      { cache: 'no-store' }
    );
    if (!channelResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch channel data' }, { status: 502 });
    }
    const channelData = await channelResponse.json();
    const uploadsPlaylistId = channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
    if (!uploadsPlaylistId) {
      return NextResponse.json({ items: [] });
    }

    const playlistResponse = await fetch(
      `${YOUTUBE_BASE_URL}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`,
      { cache: 'no-store' }
    );
    if (!playlistResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch playlist items' }, { status: 502 });
    }
    const playlistData = await playlistResponse.json();
    const videoIds = (playlistData.items || []).map((item: any) => item.snippet?.resourceId?.videoId).filter(Boolean).join(',');
    if (!videoIds) {
      return NextResponse.json({ items: [] });
    }

    const videosResponse = await fetch(
      `${YOUTUBE_BASE_URL}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${apiKey}`,
      { cache: 'no-store' }
    );
    if (!videosResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch video details' }, { status: 502 });
    }
    const videosData = await videosResponse.json();
    return NextResponse.json({ items: videosData.items || [] });
  } catch {
    return NextResponse.json({ error: 'YouTube request failed' }, { status: 500 });
  }
}
