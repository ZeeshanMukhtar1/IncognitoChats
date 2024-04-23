import { z } from 'zod';
import UserModel from '@/models/User';
import dbConnect from '@/lib/dbConnect';
import { ussernameValidation } from '@/schemas/signupSchema';

// checking username uniqueness using my own schema from SignupSchema file
const usernameQuerySchema = z.object({
  username: ussernameValidation,
});

export async function GET(request: Request) {
  // not applicable in NEW VERSION of NEXT.Js
  //   if (request.method !== 'GET') {
  //     return Response.json(
  //       {
  //         success: false,
  //         message: 'Invalid request method. we are accepting only GET requests',
  //       },
  //       { status: 405 }
  //     );
  //   }
  await dbConnect();

  try {
    // full URL: http://localhost:3000/api/check-username-unique?username=zeeshanMukhtar1
    const { searchParams } = new URL(request.url);
    // extracting username from URL  "username=zeeshanMukhtar1"
    const queryParam = {
      username: searchParams.get('username'),
    };
    // validating username with Zod schema
    const result = usernameQuerySchema.safeParse(queryParam);
    console.log('result: ', result);
    // if username is not valid
    if (!result.success) {
      const usernameError = result.error.format().username?._errors || [];
      return Response.json(
        {
          success: false,
          message:
            usernameError?.length > 0
              ? usernameError.join(', ')
              : 'Invalid username query parameter',
        },
        { status: 400 }
      );
    }
    // if username is valid
    // first log the Data to observe the output
    const { username } = result.data;
    const existingVerifiedUser = await UserModel.findOne({
      username,
      isVerified: true,
    });

    // if username is already taken
    if (existingVerifiedUser) {
      return Response.json(
        { success: false, message: 'Username already taken' },
        { status: 400 }
      );
    }

    return Response.json(
      { success: true, message: 'Username available' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error in check-username-unique route: ', error.message);
    return Response.json(
      { success: false, message: 'error in check-username-unique route' },
      { status: 500 }
    );
  }
}
