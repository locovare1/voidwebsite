# YouTube API Integration Setup

This guide will help you set up the YouTube API integration to display your latest videos on the homepage.

## Prerequisites

1. A Google account
2. A YouTube channel
3. Access to Google Cloud Console

## Step 1: Get YouTube API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3:
   - Go to "APIs & Services" > "Library"
   - Search for "YouTube Data API v3"
   - Click on it and press "Enable"
4. Create credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

## Step 2: Get Your Channel ID

### Method 1: From YouTube Studio
1. Go to [YouTube Studio](https://studio.youtube.com/)
2. In the left sidebar, click "Settings"
3. Click "Channel" > "Basic info"
4. Your Channel ID will be displayed

### Method 2: From Channel URL
1. Go to your YouTube channel
2. Look at the URL - if it's like `youtube.com/channel/UC...`, the part after `/channel/` is your Channel ID
3. If your URL is like `youtube.com/c/YourChannelName`, you'll need to use Method 1 or 3

### Method 3: From Page Source
1. Go to your YouTube channel
2. Right-click and "View Page Source"
3. Search for `"channelId":"` - the value after this is your Channel ID

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```
   NEXT_PUBLIC_YOUTUBE_API_KEY=your_actual_api_key_here
   NEXT_PUBLIC_YOUTUBE_CHANNEL_ID=your_actual_channel_id_here
   ```

## Step 4: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Visit your homepage - you should see your latest YouTube videos in the carousel

## API Quota and Limits

- YouTube Data API v3 has a daily quota limit
- Each request costs quota units
- The default quota is 10,000 units per day
- Getting channel videos typically costs 1-3 units per request
- Monitor your usage in Google Cloud Console

## Troubleshooting

### Videos not loading
1. Check that your API key is correct
2. Verify your Channel ID is correct
3. Ensure the YouTube Data API v3 is enabled
4. Check browser console for error messages
5. Verify your channel has public videos

### API Quota Exceeded
1. Check your quota usage in Google Cloud Console
2. Consider caching video data to reduce API calls
3. Request a quota increase if needed

### CORS Issues
The API calls are made from the client-side, so make sure your API key is configured for web applications.

## Features

The YouTube integration includes:
- ✅ Latest videos from your channel
- ✅ Video thumbnails
- ✅ Video titles and descriptions
- ✅ View counts and duration
- ✅ Direct links to YouTube
- ✅ Responsive carousel design
- ✅ Fallback content when API is unavailable

## Customization

You can customize the YouTube carousel by:
- Changing the number of videos displayed (modify `maxResults` in the service)
- Updating the carousel animation speed
- Modifying the video card design
- Adding additional video metadata

## Security Notes

- Never commit your actual API keys to version control
- Use environment variables for all sensitive data
- Consider implementing server-side caching to reduce API calls
- Monitor your API usage regularly