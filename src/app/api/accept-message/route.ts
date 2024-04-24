import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { User } from 'next-auth';

export async function POST(request: Request) {
  await dbConnect();
  // getting currectly logged in user
  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = user._id;
  const { acceptMessages } = await request.json();

  try {
    const updatedUSer = await UserModel.findByIdAndUpdate(
      userId,
      {
        isAcceptingMessage: acceptMessages,
      },
      {
        new: true,
      }
    );

    if (!updatedUSer) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        {
          status: 404,
        }
      );
    } else {
      return Response.json(
        {
          success: true,
          message: 'User acceptMessages status updated successfully',
          updatedUSer,
        },
        {
          status: 200,
        }
      );
    }
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: 'failed to update user acceptMessages status',
      },
      {
        status: 500,
      }
    );
  }
}

export async function GET(request: Request) {
  await dbConnect();
  // getting currectly logged in user
  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !session.user) {
    return Response.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 }
    );
  }

  const userId = user._id;
  try {
    const foundUser = await UserModel.findById(userId);
    if (!foundUser) {
      return Response.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // if user found
    return Response.json(
      {
        success: true,
        message: 'User is found',
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    return Response.json(
      { success: false, message: 'Failed to get user' },
      { status: 500 }
    );
  }
}
