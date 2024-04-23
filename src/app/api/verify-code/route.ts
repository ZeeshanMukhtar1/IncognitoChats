import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, code } = await request.json();
    // extracting the Encoded username from URL to decode it
    const decodedUsername = decodeURIComponent(username);
    const user = await UserModel.findOne({ username: decodedUsername });
    if (!user) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    // checking expiry date is more than NOW and code is valid
    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();
    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true; // updating the user to verified 😎
      await user.save();
      return Response.json(
        { success: true, message: 'User verified succefully' },
        {
          status: 200,
        }
      );
    } else if (!isCodeValid) {
      return Response.json(
        { success: false, message: 'Invalid code' },
        { status: 400 }
      );
    } else {
      return Response.json(
        { success: false, message: 'Code expired' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return Response.json(
      { success: false, message: 'error verifying user' },
      { status: 500 }
    );
  }
}
