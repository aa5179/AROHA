# OAuth Setup Guide for Aroha

Your login and signup pages now have professional OAuth buttons for Google, Facebook, and X (Twitter). To make them work, you need to configure each provider in Supabase.

## � QUICK FIX: "Error 400: Redirect URI Mismatch"

If you're getting a redirect URI mismatch error:

1. **For Google Cloud Console:**

   - Add ALL these URLs to "Authorized redirect URIs":

   ```
   https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
   http://localhost:5173/dashboard
   https://aroha-flax.vercel.app/dashboard
   ```

2. **For Facebook Developers:**

   - Add ALL these URLs to "Valid OAuth Redirect URIs":

   ```
   https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
   http://localhost:5173/dashboard
   https://aroha-flax.vercel.app/dashboard
   ```

3. **For Twitter/X:**

   - Add ALL these URLs to "Callback URLs":

   ```
   https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
   http://localhost:5173/dashboard
   https://aroha-flax.vercel.app/dashboard
   ```

4. **Important:**
   - ✅ Add each URL on a **separate line**
   - ✅ No trailing slashes: `/dashboard` NOT `/dashboard/`
   - ✅ **Wait 1-2 minutes** after saving for changes to propagate
   - ✅ **Clear browser cache** before testing again

---

## �🔧 Supabase Configuration

### Step 1: Access Supabase Dashboard

1. Go to https://supabase.com
2. Select your project: **Aroha**
3. Navigate to **Authentication** → **Providers**

---

## 🟦 Google OAuth Setup

### Step 2A: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Configure consent screen if prompted
7. Application type: **Web application**
8. Add **ALL** these authorized redirect URIs:
   ```
   https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
   http://localhost:5173/dashboard
   https://aroha-flax.vercel.app/dashboard
   ```
   ⚠️ **Important**: Add each URL on a separate line, press Enter after each one
9. Copy **Client ID** and **Client Secret**

### Step 2B: Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and toggle it **ON**
3. Paste your **Client ID**
4. Paste your **Client Secret**
5. Click **Save**

---

## 🟦 Facebook OAuth Setup

### Step 3A: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Choose **Consumer** app type
4. Enter app details and create
5. Go to **Settings** → **Basic**
6. Copy **App ID** and **App Secret**
7. Add **Facebook Login** product
8. In **Facebook Login Settings**, add **ALL** these OAuth redirect URIs:
   ```
   https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
   http://localhost:5173/dashboard
   https://aroha-flax.vercel.app/dashboard
   ```
   ⚠️ **Important**: Add each URL on a separate line

### Step 3B: Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Facebook** and toggle it **ON**
3. Paste your **App ID** (as Client ID)
4. Paste your **App Secret** (as Client Secret)
5. Click **Save**

---

## ⬛ X (Twitter) OAuth Setup

### Step 4A: Create Twitter App

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new project and app
3. Go to your app settings
4. Enable **OAuth 2.0**
5. Set **ALL** these Callback URLs:
   ```
   https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
   http://localhost:5173/dashboard
   https://aroha-flax.vercel.app/dashboard
   ```
   ⚠️ **Important**: Add each URL separately
6. Copy **Client ID** and **Client Secret**

### Step 4B: Configure in Supabase

1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Twitter** and toggle it **ON**
3. Paste your **Client ID**
4. Paste your **Client Secret**
5. Click **Save**

---

## ✅ Testing OAuth

After configuration:

1. **Clear browser cache** and cookies
2. Go to your login page: http://localhost:5173/login
3. Click on any OAuth button (Google, Facebook, or X)
4. You should be redirected to the provider's login page
5. After authorization, you'll be redirected back to your dashboard

---

## 🚀 What's Already Implemented

### ✅ Frontend (Done)

- Professional OAuth buttons with brand colors
- Smooth animations and hover effects
- Loading states
- Error handling
- Works on both Login and Signup pages

### ✅ Backend (Done)

- `loginWithOAuth()` function in AuthContext
- Automatic redirect to `/dashboard` after login
- Profile creation for new OAuth users
- Session management

---

## 📝 Important Notes

1. **Redirect URL**: Always use your Supabase callback URL:

   ```
   https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
   ```

2. **Production URL**: When deploying to Vercel, add this redirect URL too:

   ```
   https://aroha-flax.vercel.app/dashboard
   ```

3. **Environment Variables**: No additional env variables needed for OAuth - Supabase handles everything!

4. **User Data**: OAuth providers return:
   - Email
   - Name (from provider)
   - Profile picture (stored in user metadata)

---

## 🐛 Troubleshooting

### "Invalid redirect URI"

- Check that you added the exact Supabase callback URL in provider settings
- Make sure there are no trailing slashes or typos

### "OAuth provider not enabled"

- Verify the provider is toggled ON in Supabase dashboard
- Check that you saved the Client ID and Secret

### "Access denied"

- User might have cancelled the OAuth flow
- Check app permissions in provider settings

### "Email already exists"

- If user signed up with email/password, they can't use OAuth with same email
- They need to sign in with the original method

---

## 🎨 OAuth Button Colors

The buttons use official brand colors:

- **Google**: White background with colored logo
- **Facebook**: #1877F2 (Facebook Blue)
- **X/Twitter**: Black (or white in dark mode)

---

## 🔐 Security Features

- Supabase handles all OAuth flows securely
- PKCE (Proof Key for Code Exchange) enabled by default
- No tokens stored in frontend
- Automatic session refresh
- Built-in CSRF protection

---

## 📱 Mobile Support

All OAuth buttons are:

- Touch-friendly (44px minimum height)
- Responsive on all screen sizes
- Properly spaced for easy tapping
- Smooth animations optimized for mobile

---

## Next Steps

1. **Configure at least Google OAuth** (most commonly used)
2. **Test the flow** on localhost
3. **Update redirect URLs** when deploying to production
4. **Monitor OAuth signups** in Supabase Authentication dashboard

---

## 📋 Quick Reference: ALL Redirect URLs You Need

Copy and paste these into your OAuth provider settings:

### ✅ For Google Cloud Console (Authorized redirect URIs):

```
https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
http://localhost:5173/dashboard
https://aroha-flax.vercel.app/dashboard
```

### ✅ For Facebook Developers (Valid OAuth Redirect URIs):

```
https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
http://localhost:5173/dashboard
https://aroha-flax.vercel.app/dashboard
```

### ✅ For Twitter/X (Callback URLs):

```
https://kyrallegytyvlugdihag.supabase.co/auth/v1/callback
http://localhost:5173/dashboard
https://aroha-flax.vercel.app/dashboard
```

### 💡 Tips:

- ✅ Add each URL on a new line (press Enter after each)
- ✅ Don't forget to click **Save** in each provider console
- ✅ Wait 1-2 minutes for changes to take effect
- ✅ Clear browser cache before testing
- ✅ Check for typos - URLs must match EXACTLY

Good luck! 🚀
