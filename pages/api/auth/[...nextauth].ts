import NextAuth, {
  Account,
  Profile,
  User,
  Session,
  DefaultSession,
  SessionStrategy,
} from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";

type TokenType = JWT & { accessToken: string | undefined };

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope:
            "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/youtube",
        },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" as SessionStrategy },
  pages: {
    signIn: "../../signin",
    signOut: "../../signout",
    // error: '/auth/error', // Error code passed in query string as ?error=
    // verifyRequest: '/auth/verify-request', // (used for check email message)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  callbacks: {
    async jwt({
      token,
      account,
    }: {
      token: JWT;
      user?: User;
      account?: Account | null;
      profile?: Profile;
      isNexUser?: boolean;
    }) {
      //   if (user) {
      //     token.id = user.id;
      //   }
      if (account) {
        token.accessToken = account.access_token;
      }
      return token /* { ...token, accessToken: account?.access_token, id: user?.id } */;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;

        // session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};
export default NextAuth(authOptions);
