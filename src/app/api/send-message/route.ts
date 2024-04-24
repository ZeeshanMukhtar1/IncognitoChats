import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import { Message } from '@/models/User';

export async function POST(request: Request) {
  await dbConnect();
  const { usename, content } = await request.json();
  try {
    const user = await UserModel.findOne({ username: usename });
    if (!user) {
      return Response.json(
        {
          success: false,
          message: 'User not found',
        },
        {
          status: 404,
        }
      );
    }
    // check weather user is acceting messages or not
    if (!user.isAcceptingMessage) {
      return Response.json(
        {
          success: false,
          message: 'User is not accepting messages',
        },
        {
          status: 400,
        }
      );
    }
    // creafting new message and pushing it to user messages array
    const newMessage = {
      content,
      createdAt: new Date(),
    };
    user.message.push(newMessage as Message);
    await user.save();
    return Response.json(
      {
        success: true,
        message: 'Message sent successfully',
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: 'Failed to send message',
      },
      {
        status: 500,
      }
    );
  }
}
