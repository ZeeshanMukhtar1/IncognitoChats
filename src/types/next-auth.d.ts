import 'next-auth';
// design the custom types for my custom use in options.ts file to make token more POWERFUL 🤯

//  docs link for making custom types for next-auth 🙂 : https://next-auth.js.org/getting-started/typescript
declare module 'next-auth' {
  interface Session {
    user: {
      _id?: string;
      isVerified?: boolean;
      isAcceptingMessages?: boolean;
      username?: string;
    } & DefaultSession['user'];
  }

  interface User {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}

// 2nd way to make custom types manually
declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    isVerified?: boolean;
    isAcceptingMessages?: boolean;
    username?: string;
  }
}
