import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { User } from 'next-auth';
import mongoose from 'mongoose';

//  docs link for pull operater : https://www.mongodb.com/docs/manual/reference/operator/update/pull/

export async function DELETE(
  request: Request,
  { params }: { params: { messageid: string } }
) {
  // extract the messageid from the params
  const { messageid } = params;
  await dbConnect();
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !session.user) {
    return Response.json(
      {
        success: false,
        message: 'Unauthorized',
      },
      {
        status: 401,
      }
    );
  }

  try {
    const updatedResult = await UserModel.updateOne(
      { _id: user.id },
      {
        $pull: {
          messages: {
            _id: messageid,
          },
        },
      }
    );

    if (updatedResult.modifiedCount === 0) {
      return Response.json(
        {
          success: false,
          message: 'Message not found or alredy deleted',
        },
        {
          status: 404,
        }
      );
    }

    return Response.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting message', error);
    return Response.json(
      {
        success: false,
        message: 'failed to delete message',
      },
      {
        status: 500,
      }
    );
  }
}
