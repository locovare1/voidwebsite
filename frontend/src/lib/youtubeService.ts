// YouTube API Service
// This service handles fetching videos from YouTube API

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  videoId: string;
  duration: string;
  views: string;
  publishedAt: string;
  description?: string;
  channelTitle?: string;
}

class YouTubeService {
  private apiKey: string = '';
  private channelId: string = '';
  private baseUrl = 'https://www.googleapis.com/youtube/v3';

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    this.channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || '';
  }

  setCredentials(apiKey: string, channelId: string) {
    this.apiKey = apiKey;
    this.channelId = channelId;
  }

  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (isNaN(count)) return '0';
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count.toString();
  }

  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let formatted = '';
    if (hours) formatted += hours + ':';
    formatted += (minutes || '0').padStart(hours ? 2 : 1, '0') + ':';
    formatted += (seconds || '0').padStart(2, '0');

    return formatted;
  }

  async getLatestVideos(maxResults: number = 10): Promise<YouTubeVideo[]> {
    if (!this.apiKey || !this.channelId) {
      if (!this.apiKey) console.error('❌ YouTube API Key is MISSING!');
      if (!this.channelId) console.error('❌ YouTube Channel ID is MISSING!');
      return this.getFallbackVideos();
    }

    try {
      console.log('📡 Attempting YouTube fetch for:', this.channelId);

      let identifierParam = '';
      if (this.channelId.startsWith('@')) {
        identifierParam = `forHandle=${this.channelId.substring(1)}`;
      } else if (this.channelId.startsWith('UC')) {
        identifierParam = `id=${this.channelId}`;
      } else {
        identifierParam = `forHandle=${this.channelId}`;
      }

      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=contentDetails&${identifierParam}&key=${this.apiKey}`
      );

      if (!channelResponse.ok) {
        const errorData = await channelResponse.json();
        console.error('❌ YouTube API Error Response:', errorData);
        throw new Error(`Failed to fetch channel data: ${channelResponse.statusText}`);
      }

      const channelData = await channelResponse.json();
      if (!channelData.items || channelData.items.length === 0) {
        console.warn('⚠️ No channel found for:', this.channelId);
        throw new Error('Channel not found');
      }

      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;
      if (!uploadsPlaylistId) throw new Error('Could not find uploads playlist');

      const playlistResponse = await fetch(
        `${this.baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!playlistResponse.ok) throw new Error('Failed to fetch playlist items');

      const playlistData = await playlistResponse.json();
      if (!playlistData.items || playlistData.items.length === 0) return [];

      const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      const videosResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      if (!videosResponse.ok) throw new Error('Failed to fetch video details');

      const videosData = await videosResponse.json();
      return videosData.items.map((video: any): YouTubeVideo => ({
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.maxresdefault?.url ||
          video.snippet.thumbnails.high?.url ||
          video.snippet.thumbnails.medium?.url,
        videoId: video.id,
        duration: this.formatDuration(video.contentDetails.duration),
        views: this.formatViewCount(video.statistics.viewCount),
        publishedAt: video.snippet.publishedAt,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
      }));

    } catch (error) {
      console.error('❌ YouTube API Error:', error);
      return this.getFallbackVideos();
    }
  }

  private getFallbackVideos(): YouTubeVideo[] {
    return [
      {
        id: '1',
        title: "VOID Esports Highlights",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        videoId: "dQw4w9WgXcQ",
        duration: "5:23",
        views: "125K",
        publishedAt: new Date().toISOString(),
      },
      {
        id: '2',
        title: "Best Plays Compilation",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        videoId: "dQw4w9WgXcQ",
        duration: "8:45",
        views: "89K",
        publishedAt: new Date().toISOString(),
      },
      {
        id: '3',
        title: "Team Training Session",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        videoId: "dQw4w9WgXcQ",
        duration: "12:30",
        views: "67K",
        publishedAt: new Date().toISOString(),
      },
      {
        id: '4',
        title: "Tournament Victory",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        videoId: "dQw4w9WgXcQ",
        duration: "6:15",
        views: "203K",
        publishedAt: new Date().toISOString(),
      },
      {
        id: '5',
        title: "Behind the Scenes",
        thumbnail: "https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
        videoId: "dQw4w9WgXcQ",
        duration: "9:42",
        views: "45K",
        publishedAt: new Date().toISOString(),
      },
    ];
  }

  async searchVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    if (!this.apiKey) return this.getFallbackVideos();

    try {
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );
      if (!searchResponse.ok) throw new Error('Failed to search videos');

      const searchData = await searchResponse.json();
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      const videosResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );
      if (!videosResponse.ok) throw new Error('Failed to fetch video details');

      const videosData = await videosResponse.json();
      return videosData.items.map((video: any): YouTubeVideo => ({
        id: video.id,
        title: video.snippet.title,
        thumbnail: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.medium?.url,
        videoId: video.id,
        duration: this.formatDuration(video.contentDetails.duration),
        views: this.formatViewCount(video.statistics.viewCount),
        publishedAt: video.snippet.publishedAt,
        description: video.snippet.description,
        channelTitle: video.snippet.channelTitle,
      }));
    } catch (error) {
      console.error('Error searching YouTube videos:', error);
      return this.getFallbackVideos();
    }
  }
}

export const youtubeService = new YouTubeService();