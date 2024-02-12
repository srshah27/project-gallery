import db from '@/lib/db'
import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcrypt'

export const options: NextAuthOptions = {
	providers: [
		CredentialsProvider({
			name: 'credentials',
			credentials: {
				email: { label: 'email', type: 'email' },
				password: { label: 'Password', type: 'password' },
			},
			async authorize(credentials, req) {
				if (!credentials || !credentials.email || !credentials.password)
					return null

				const [results, _] = (await db.execute(
					'SELECT * FROM `users` WHERE email = ?',
					[credentials.email]
				)) as any[]

				if (results.length === 0) return null

				const passwordcompare = await bcrypt.compare(
					credentials.password,
					results[0].password
				)

				if (!passwordcompare) return null
				
				return results[0]
			},
		}),
	],

	debug: true,

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
			console.log('JWT Callback', token, user, session)
			return token
		},
		async session({ session, user, token }) {
			console.log('Session Callback', token, user, session)
			return session
		},
	},
}
