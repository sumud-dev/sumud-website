# Cloudinary Image Upload - Database Migration Guide

## Current Implementation

The profile avatar upload is currently stored in **localStorage** as a temporary solution. The uploaded image URL from Cloudinary is saved to the browser's localStorage and persists across sessions.

## Recommended: Add Avatar Column to Users Table

To properly persist avatar URLs in the database, you should add an `avatar_url` column to the `users` table.

### Migration SQL

Run this SQL in your Supabase SQL Editor:

```sql
-- Add avatar_url column to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Add bio column for user biography
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_users_supabase_id 
ON public.users(supabase_id);

-- Add updated_at column for tracking changes
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON public.users 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at_column();
```

### After Running Migration

1. **Regenerate TypeScript types:**
   ```bash
   npx supabase gen types typescript --project-id tneaissclzbcysspxoti > src/lib/database.types.ts
   ```

2. **Update the settings page** to use the database instead of localStorage:
   - Replace `localStorage` save/load with calls to `updateUserProfile()` and `getUserProfile()`
   - Import the actions: `import { updateUserProfile, getUserProfile } from "@/src/actions/user.actions"`

3. **Example implementation:**
   ```typescript
   // In settings page
   const handleSaveProfile = async () => {
     setIsSaving(true);
     try {
       const result = await updateUserProfile(userId, {
         name: profile.name,
         email: profile.email,
         avatar_url: profile.avatar,
         bio: profile.bio,
       });
       
       if (result.success) {
         toast.success(t("profile.successMessage"));
       } else {
         toast.error(result.error || "Failed to save profile");
       }
     } catch (error) {
       console.error("Error saving profile:", error);
       toast.error("Failed to save profile");
     } finally {
       setIsSaving(false);
     }
   };
   ```

## Current Features Working

✅ **Image Upload to Cloudinary**
- All admin forms (Events, Articles, Campaigns, Profile) have Cloudinary upload
- Drag & drop file upload
- Image preview
- Upload progress indicator
- File validation (size, type)
- Multi-language support (EN, AR, FI)

✅ **Profile Avatar**
- Upload avatar to Cloudinary
- Preview avatar in real-time
- Avatar persists in localStorage between sessions
- Auto-save when clicking "Save Settings" button

✅ **Dual Input Support**
- Upload files directly via drag & drop
- Or paste image URL as fallback

## Files Modified

- `src/lib/utils/cloudinary.ts` - Cloudinary utility functions
- `src/components/ui/image-upload.tsx` - Reusable upload component
- `src/app/api/upload/route.ts` - Upload API endpoint
- `src/actions/user.actions.ts` - User profile actions (ready for DB integration)
- `src/app/[locale]/admin/settings/page.tsx` - Settings page with localStorage
- `src/components/admin/settings/tabs/ProfileTab.tsx` - Profile tab with ImageUpload
- All article/campaign/event forms - Added ImageUpload components

## Cloudinary Configuration

Make sure to add your Cloudinary credentials to `.env.local`:

```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Image Organization

Images are uploaded to specific Cloudinary folders:
- `avatars/` - User profile avatars
- `events/` - Event featured images
- `articles/` - Article featured images
- `campaigns/` - Campaign images
