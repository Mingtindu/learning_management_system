// models/Discussion.js
import mongoose from "mongoose";

const discussionSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 200
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Programming', 'Web Design', 'Career', 'General']
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    views: {
        type: Number,
        default: 0
    },
    isAnswered: {
        type: Boolean,
        default: false
    },
    hasInstructorReply: {
        type: Boolean,
        default: false
    },
    isPinned: {
        type: Boolean,
        default: false
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    lastActivity: {
        type: Date,
        default: Date.now
    },
    repliesCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Create slug from title
discussionSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
    }
    next();
});

// Update lastActivity when discussion is modified
discussionSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.lastActivity = new Date();
    }
    next();
});

export const Discussion = mongoose.model("Discussion", discussionSchema);

// models/Reply.js
const replySchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    discussion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Discussion',
        required: true
    },
    parentReply: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Reply',
        default: null
    },
    isInstructorReply: {
        type: Boolean,
        default: false
    },
    isAcceptedAnswer: {
        type: Boolean,
        default: false
    },
    upvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    downvotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Update discussion's lastActivity and repliesCount when reply is created
replySchema.post('save', async function() {
    await Discussion.findByIdAndUpdate(this.discussion, {
        lastActivity: new Date(),
        $inc: { repliesCount: 1 }
    });
    
    // Check if this is an instructor reply
    const user = await mongoose.model('User').findById(this.author);
    if (user && user.role === 'instructor') {
        await Discussion.findByIdAndUpdate(this.discussion, {
            hasInstructorReply: true
        });
    }
    
    // If this reply is marked as accepted answer, mark discussion as answered
    if (this.isAcceptedAnswer) {
        await Discussion.findByIdAndUpdate(this.discussion, {
            isAnswered: true
        });
    }
});

// Update discussion's repliesCount when reply is deleted
replySchema.post('deleteOne', { document: true }, async function() {
    await Discussion.findByIdAndUpdate(this.discussion, {
        $inc: { repliesCount: -1 }
    });
});

export const Reply = mongoose.model("Reply", replySchema);
