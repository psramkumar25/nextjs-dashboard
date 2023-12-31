import type { NextAuthConfig } from 'next-auth';
 
export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl, url } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn) {
        // logic to redirect to previous page
        // const search = new URL(url).searchParams;
        // const callback = search.get('callbackUrl') || '/dashboard';
        // const cdBURL = decodeURIComponent(callback);
        // console.log(`User AUTHORIZED: ${url}\n\nRedirecting to ${cdBURL}`);
        // return Response.redirect(new URL(cdBURL, nextUrl));
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // Add providers with an empty array for now

} satisfies NextAuthConfig;