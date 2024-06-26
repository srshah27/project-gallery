export const maxDuration = 30;
import db from '@/db/db';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcrypt';

export const options: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials, req) {
        console.log('initializeing auth')
        if (!credentials || !credentials.email || !credentials.password)
          throw new Error('Please Provide Email and Password');

        const [results, _] = (await db.execute(
          'SELECT * FROM `users` WHERE email = ?',
          [credentials.email]
        )) as any[];
        console.log('database respponsse success')

        if (results.length === 0) throw new Error('User not Found');

        console.log('user found in database')
        const passwordcompare = await bcrypt.compare(
          credentials.password,
          results[0].password
        );

        console.log('password matched')
        if (!passwordcompare)
          throw new Error('Email ID or Password is Incorrect');
        console.log('user found in database')
        
        return {
          user_name: results[0].user_name,
          name: results[0].name,
          email: results[0].email,
          profile_image: results[0].profile_image,
        } as any;
      },
    }),
  ],

  debug: false,

  theme: {
    colorScheme: 'auto',
  },

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: 'jwt',
    maxAge: 15 * 24 * 60 * 60, // 15 days
  },

  // custom signIn, signOut, verifyUser, error etc. paths
  pages: {
    signIn: '/signin',
  },

  callbacks: {
    async jwt({ token, user, session }) {
      // console.log('JWT Callback', token, user, session);
      return token;
    },
    async session({ session, user, token }) {
      // console.log('Session Callback', token, user, session);
      return session;
    },
  },
};
