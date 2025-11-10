// YouTube API Service
// This service will handle fetching videos from YouTube API

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
    // Initialize with environment variables when available
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    this.channelId = process.env.NEXT_PUBLIC_YOUTUBE_CHANNEL_ID || '';
  }

  // Set API credentials (call this when you have the API key)
  setCredentials(apiKey: string, channelId: string) {
    this.apiKey = apiKey;
    this.channelId = channelId;
  }

  // Format view count to readable format (e.g., 1.2K, 1.5M)
  private formatViewCount(viewCount: string): string {
    const count = parseInt(viewCount);
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + 'M';
    } else if (count >= 1000) {
      return (count / 1000).toFixed(1) + 'K';
    }
    return count.toString();
  }

  // Format duration from ISO 8601 format (PT4M13S) to readable format (4:13)
  private formatDuration(duration: string): string {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return '0:00';

    const hours = (match[1] || '').replace('H', '');
    const minutes = (match[2] || '').replace('M', '');
    const seconds = (match[3] || '').replace('S', '');

    let formatted = '';
    if (hours) {
      formatted += hours + ':';
    }
    formatted += (minutes || '0').padStart(hours ? 2 : 1, '0') + ':';
    formatted += (seconds || '0').padStart(2, '0');

    return formatted;
  }

  // Get duration in seconds from ISO 8601 format
  private getDurationInSeconds(duration: string): number {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;

    const hours = parseInt((match[1] || '0').replace('H', '')) || 0;
    const minutes = parseInt((match[2] || '0').replace('M', '')) || 0;
    const seconds = parseInt((match[3] || '0').replace('S', '')) || 0;

    return hours * 3600 + minutes * 60 + seconds;
  }

  // Check if video is long-form (4+ minutes)
  private isLongFormVideo(duration: string): boolean {
    const durationInSeconds = this.getDurationInSeconds(duration);
    return durationInSeconds >= 240; // 4 minutes = 240 seconds
  }

  // Get latest videos from the channel
  async getLatestVideos(maxResults: number = 10): Promise<YouTubeVideo[]> {
    if (!this.apiKey || !this.channelId) {
      console.warn('YouTube API key or channel ID not set');
      return this.getFallbackVideos();
    }

    try {
      // First, get the channel's uploads playlist ID
      const channelResponse = await fetch(
        `${this.baseUrl}/channels?part=contentDetails&id=${this.channelId}&key=${this.apiKey}`
      );
      
      if (!channelResponse.ok) {
        throw new Error('Failed to fetch channel data');
      }

      const channelData = await channelResponse.json();
      const uploadsPlaylistId = channelData.items[0]?.contentDetails?.relatedPlaylists?.uploads;

      if (!uploadsPlaylistId) {
        throw new Error('Could not find uploads playlist');
      }

      // Get videos from the uploads playlist
      const playlistResponse = await fetch(
        `${this.baseUrl}/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!playlistResponse.ok) {
        throw new Error('Failed to fetch playlist items');
      }

      const playlistData = await playlistResponse.json();
      const videoIds = playlistData.items.map((item: any) => item.snippet.resourceId.videoId).join(',');

      // Get detailed video information including duration and view count
      const videosResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

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
      console.error('Error fetching YouTube videos:', error);
      return this.getFallbackVideos();
    }
  }

  // Fallback videos when API is not available
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

  // Search for videos by query
  async searchVideos(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    if (!this.apiKey) {
      console.warn('YouTube API key not set');
      return this.getFallbackVideos();
    }

    try {
      const searchResponse = await fetch(
        `${this.baseUrl}/search?part=snippet&q=${encodeURIComponent(query)}&type=video&maxResults=${maxResults}&key=${this.apiKey}`
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to search videos');
      }

      const searchData = await searchResponse.json();
      const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',');

      // Get detailed video information
      const videosResponse = await fetch(
        `${this.baseUrl}/videos?part=snippet,contentDetails,statistics&id=${videoIds}&key=${this.apiKey}`
      );

      if (!videosResponse.ok) {
        throw new Error('Failed to fetch video details');
      }

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