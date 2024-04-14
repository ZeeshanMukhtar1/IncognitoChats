import mongoose, { Schema, Document } from 'mongoose'; // document import for typescipt

// definging custom types for Messagge
export interface Message extends Document {
  content: string;
  createdAt: Date;
}
// <>  used for using custom schema
const MessageSchema: Schema<Message> = new Schema({
  content: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

// definging custom types for User
export interface User extends Document {
  username: string;
  email: string;
  password: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  isAcceptingMessage: boolean;
  // attaching user and messages together
  message: Message[];
}

const UserSchema: Schema<User> = new Schema({
  username: {
    type: String,
    required: [true, 'username is required field'],
    trim: true, // if someone will add some extra spaces
    unique: true,
  },
  email: {
    type: String,
    required: [true, 'email is required field'],
    unique: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please use a valid email address',
    ],
  },
  password: {
    type: String,
    required: [true, 'password is required field'],
  },
  verifyCode: {
    type: String,
    required: [true, 'verofycode is required field'],
  },
  verifyCodeExpiry: {
    type: Date,
    required: [true, 'verofycode is expiry isa require field'],
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isAcceptingMessage: {
    type: Boolean,
    default: true,
  },
  message: [MessageSchema],
});

// In Express, the server continues running once it boots up. However, in Next.js, it's not inherently aware of whether the app is booting up for the first time or not. It runs on Edge time so we have to check for the existing presence 😶
const UserModel =
  (mongoose.models.User as mongoose.Model<User>) ||
  mongoose.model<User>('User', UserSchema);

export default UserModel;
