import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/User';
import bcrypt from 'bcryptjs';
import { sendVerificationEmail } from '@/helpers/sendVerificationEmail';

export async function POST(request: Request) {
  await dbConnect();
  try {
    const { username, email, password } = await request.json(); // always use await with request.json() because it returns a promise
    
    // check the user that alredy registered by username and verified as well
    const existingUserVerifiedByUsername = await UserModel.findOne({
      username,
      isVerified: true,
    });
    if (existingUserVerifiedByUsername) {
      return Response.json(
        {
          success: false,
          message: 'Username already taken . Please try another username.',
        },
        {
          status: 400,
        }
      );
    }
    const existingUSerByEmail = await UserModel.findOne(email);
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString(); // random 6 digit code
    if (existingUSerByEmail) {
      if (existingUSerByEmail.isVerified) {
        return Response.json(
          {
            success: false,
            message: 'Email already registered with this email.',
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUSerByEmail.password = hashedPassword; // only update the password
        existingUSerByEmail.verifyCode = verifyCode; // update the verification code
        existingUSerByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);
        await existingUSerByEmail.save();
        // now after this step the control will directly go to the sendVerificationEmail part at the end 😉
      }
    }
    // if user is not registered then create a new user
    else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1); // 1 hour from now to expire the verification code
      // here exipiary date is an object thats why here let , var , const donest matter because we use New Date() to create an object using New keyword.
      // save the user
      const NewUSer = new UserModel({
        username,
        email,
        password: hashedPassword,
        verifyCode: verifyCode,
        verifyCodeExpiry: expiryDate,
        isVerified: false, // by default user is not verified in model as well
        isAcceptingMessage: true,
        // attaching user and messages together
        message: [],
      });
      await NewUSer.save();
      // send verification email
      const emailResponse = await sendVerificationEmail(
        email,
        username,
        verifyCode
      );
      if (!emailResponse.success) {
        return Response.json(
          {
            success: false,
            message: emailResponse.message,
          },
          {
            status: 500,
          }
        );
      }
      return Response.json(
        {
          success: true,
          message: 'User registered successfully. Please verify your email.',
        },
        {
          status: 201,
        }
      );
    }
  } catch (error) {
    console.log('Error in sign-up route: ', error); // will be displayed in the terminal
    return Response.json(
      {
        success: false,
        message: 'An error occurred while signing up. Please try again.', // will be displayed to the front-end user
      },
      {
        status: 500,
      }
    );
  }
}
