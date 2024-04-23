import nextAuth, { DefaultSession } from 'next-auth';
// design the custom types for my custom use in options.ts file to make token more POWERFUL 🤯

//  docs link for making custom types for next-auth 🙂 : https://next-auth.js.org/getting-started/typescript

declare module 'next-auth' {
  interface User {
    _id?: string; // optional field
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession['user'];
  }
}
// 2nd way to create custom types for modules
declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
