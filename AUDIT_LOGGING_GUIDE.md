# Audit Logging System Guide

## Overview
An audit logging system tracks who made what changes and when. This is essential for accountability and security in a multi-user admin system.

## How It Works

### 1. **User Authentication**
- Each user logs in with Firebase Authentication
- Firebase provides a unique user ID and email for each authenticated user
- This information is available in every request

### 2. **Logging Changes**
When a user makes a change (create, update, delete), the system records:
- **Who**: User email/ID from Firebase Auth
- **What**: Type of change (created news article, updated team, etc.)
- **When**: Timestamp of the action
- **Details**: What was changed (old value → new value)

### 3. **Implementation Options**

#### Option A: Firestore Collection (Recommended)
Create an `auditLogs` collection in Firestore:

```typescript
interface AuditLog {
  id?: string;
  userId: string;
  userEmail: string;
  action: 'create' | 'update' | 'delete';
  resourceType: 'news' | 'team' | 'product' | 'order' | etc.;
  resourceId: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
  timestamp: Timestamp;
  ipAddress?: string;
  userAgent?: string;
}
```

**Example Usage:**
```typescript
// When creating a news article
async function createNewsArticle(article: NewsArticle, user: User) {
  // Create the article
  const docRef = await addDoc(collection(db, 'newsArticles'), article);
  
  // Log the action
  await addDoc(collection(db, 'auditLogs'), {
    userId: user.uid,
    userEmail: user.email,
    action: 'create',
    resourceType: 'news',
    resourceId: docRef.id,
    timestamp: Timestamp.now(),
    changes: [{
      field: 'title',
      oldValue: null,
      newValue: article.title
    }]
  });
}
```

#### Option B: Add to Each Document
Add metadata to each document:

```typescript
interface NewsArticle {
  // ... existing fields
  _metadata: {
    createdBy: string;
    createdAt: Timestamp;
    updatedBy?: string;
    updatedAt?: Timestamp;
    version: number;
  };
}
```

### 4. **Viewing Audit Logs**

Create an admin page at `/adminpanel/audit-logs`:

```typescript
// Display logs in a table
// Filter by user, date, action type, resource type
// Search functionality
// Export to CSV
```

### 5. **Security Considerations**

1. **Read-Only for Most Users**: Only admins should view audit logs
2. **Immutable Logs**: Once written, logs should never be deleted or modified
3. **Retention Policy**: Decide how long to keep logs (e.g., 1 year)
4. **Rate Limiting**: Prevent log spam from automated actions

### 6. **Implementation Steps**

1. **Create Audit Service** (`src/lib/auditService.ts`):
   ```typescript
   export const auditService = {
     async log(action, resourceType, resourceId, changes, user) {
       // Add log entry
     },
     async getLogs(filters) {
       // Retrieve logs with filters
     }
   };
   ```

2. **Update All Services**: Add audit logging to:
   - `newsService.create/update/remove`
   - `teamService.create/update/remove`
   - `productService.create/update/remove`
   - etc.

3. **Create Audit Logs Page**: `/adminpanel/audit-logs/page.tsx`

4. **Add to Navigation**: Link in admin panel sidebar

### 7. **Advanced Features**

- **Real-time Updates**: Use Firestore listeners for live log updates
- **Email Notifications**: Alert admins of critical changes
- **Change Diff View**: Show side-by-side comparison of changes
- **User Activity Timeline**: View all actions by a specific user

## Example Implementation

I can implement this system for you. It would involve:
1. Creating the audit service
2. Updating all existing services to log changes
3. Creating the audit logs viewing page
4. Adding access control (only admins can view)

Would you like me to implement this now?

