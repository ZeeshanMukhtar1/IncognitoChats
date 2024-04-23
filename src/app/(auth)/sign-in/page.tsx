// docs link for login Ui from next js  😯 : https://next-auth.js.org/getting-started/example
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function Component() {
  const { data: session } = useSession();
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    );
  }
  return (
    <>
      Not signed in <br />
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
        onClick={() => signIn()}
      >
        Sign in
      </button>
    </>
  );
}
