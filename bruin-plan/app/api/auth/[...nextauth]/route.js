// app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: {
    strategy: 'jwt', // Using JWT for session strategy
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === 'google') {
        await dbConnect();
        try {
          let existingUser = await User.findOne({ googleId: profile.sub }); // 'sub' is the unique Google ID

          if (!existingUser) {
            // If user doesn't exist with googleId, check if an account with this email exists
            existingUser = await User.findOne({ email: profile.email });

            if (existingUser) {
              // If user exists with email, link Google account
              existingUser.googleId = profile.sub;
              existingUser.name = existingUser.name || profile.name; // Update name if not set
              existingUser.image = existingUser.image || profile.picture; // Update image if not set
              await existingUser.save();
            } else {
              // If user does not exist at all, create a new user
              await User.create({
                googleId: profile.sub,
                email: profile.email,
                name: profile.name,
                image: profile.picture,
                plannedSchedule: [], // Initialize with an empty schedule
              });
            }
          }
          return true; // Sign-in successful
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false; // Prevent sign-in on error
        }
      }
      return true; // Allow sign-in for other providers if any
    },
    async jwt({ token, user, account, profile }) {
      // Persist the user's MongoDB _id and googleId to the token
      if (user) {
        // 'user' object is available on initial sign-in
        await dbConnect();
        const dbUser = await User.findOne({ email: user.email });
        if (dbUser) {
          token.id = dbUser._id.toString(); // Add MongoDB user ID to the token
          token.googleId = dbUser.googleId;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like the user's MongoDB _id
      if (token) {
        session.user.id = token.id;
        session.user.googleId = token.googleId;
      }
      return session;
    },
  },
  pages: {
    // signIn: '/auth/signin', // Optional: custom sign-in page
    // error: '/auth/error', // Optional: custom error page
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
