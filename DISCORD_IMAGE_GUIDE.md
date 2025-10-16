# Discord Image Guide for Void Esports Admin Panel

## Why Discord Images Sometimes Fail

Discord CDN URLs have several characteristics that can cause issues:

1. **Expiration Tokens**: URLs contain `ex=` parameters that expire
2. **CORS Restrictions**: Discord may block cross-origin requests
3. **Rate Limiting**: Too many requests can be blocked

## Best Practices for Discord Images

### ✅ Recommended Approach
1. **Right-click on the image in Discord**
2. **Select "Copy image address"** (not "Copy link")
3. **Paste the URL in the admin panel**

### 🔧 What the System Does Automatically
- Removes expiration tokens (`ex=`, `is=`, `hm=` parameters)
- Uses unoptimized loading for Discord images
- Provides helpful error messages

### 🚨 If Discord Images Still Don't Work

**Alternative Solutions:**
1. **Upload to Imgur**: https://imgur.com/upload
2. **Use GitHub**: Upload to a GitHub repository and use the raw URL
3. **Use Google Drive**: Make public and use direct link
4. **Use Cloudinary**: Free tier available

### 📝 Example URLs That Work Well

**Good Discord URL:**
```
https://media.discordapp.net/attachments/123/456/image.png
```

**Imgur URL:**
```
https://i.imgur.com/abc123.png
```

**GitHub Raw URL:**
```
https://raw.githubusercontent.com/username/repo/main/image.png
```

## Troubleshooting

If you see "Failed to load image":
1. Try refreshing the admin panel
2. Check if the Discord link is still valid
3. Consider uploading to an alternative service
4. Make sure the URL ends with an image extension (.png, .jpg, .webp)

## Technical Details

The system automatically:
- Adds Discord domains to Next.js image optimization whitelist
- Processes Discord URLs to remove problematic parameters
- Falls back to the Void logo if images fail to load
- Provides specific error messages for Discord images