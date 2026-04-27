import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    profilePicture: {
      type: String,
      default: function () {
        return `https://api.dicebear.com/9.x/lorelei/svg?seed=${this.name}`;
      },
    },
    ownedBoards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Whiteboard",
      },
    ],
    sharedBoards: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Whiteboard",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

userSchema.virtual("notifications", {
  ref: "Notification",
  localField: "_id",
  foreignField: "recipient",
});

const User = mongoose.model("User", userSchema);
export default User;
