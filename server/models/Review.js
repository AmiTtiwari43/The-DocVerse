const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
    },
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    isRecommended: {
      type: Boolean,
      default: true,
    },
    detailedRatings: {
      waitTime: { type: Number, min: 1, max: 5 },
      bedsideManner: { type: Number, min: 1, max: 5 },
      staffFriendliness: { type: Number, min: 1, max: 5 },
    },
    doctorReply: {
      type: String,
    },
    doctorReplyLikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    replyDate: {
      type: Date,
    },
    userReplies: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        reply: String,
        replyDate: {
          type: Date,
          default: Date.now,
        },
        parentId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true }
);

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
