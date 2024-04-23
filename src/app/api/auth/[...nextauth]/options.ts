// necesssory imposts from nextauth js documenation
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
// other required imports
import bcryp from 'bcryptjs';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';

export const authOptions: NextAuthOptions = {
  // docs link for providers code 🙂 : https://next-auth.js.org/providers/credentials
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        // depsnds on us we want username and password or email and password
        email: { label: 'email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any): Promise<any> {
        // before we do anything we need to connect to the database
        await dbConnect();
        try {
          // first we need to check if the user exists or not
          const user = await UserModel.findOne({
            // we can use email or password individually but here we will utliize mongose OR operator to check if any of the two fields match
            $or: [
              { email: credentials.indentifier.email },
              { username: credentials.indentifier.username },
            ],
          });
          // if no user found we will throw an error
          if (!user) {
            throw new Error('no user found');
          }
          // this is my customm fields which is not documented in the nextauth documentation
          if (!user.isVerified) {
            throw new Error('plz verify your email');
          }
          // if everthing is fine we will compare the password
          const isPasswordCorrect = await bcryp.compare(
            credentials.password,
            user.password
          );
          // if password is correct we will return the user
          if (isPasswordCorrect) {
            return user;
          } else {
            throw new Error('password is incorrect');
          }
          // Note : we are giving entire user controll to the provider or auth options 🥱
        } catch (error: any) {
          throw new Error(error);
        }
      },
    }),
  ],
  // docs link for callbacks code 🙂 : https://next-auth.js.org/configuration/callbacks
  callbacks: {
    async session({ session, token }) {
      // making this session more POWERFUL
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessages = token.isAcceptingMessages;
        session.user.username = token.username;
      }
      return session;
    },
    async jwt({ token, user }) {
      // making this token more POWERFUL  so that we can exract more info from it insted of hitting database again and again  🤯
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },
  },

  //  docs link for pages code 🙂 :https://next-auth.js.org/configuration/pages
  pages: {
    signIn: '/sign-in',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXT_AUTH_SECRET, // most important part of the code
};
