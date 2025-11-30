import mongoose from "mongoose";
import { Discussion, Reply } from "../models/forum.model.js";
import { User } from "../models/user.model.js";


// Get replies for a discussion
export const getReplies = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        if (!mongoose.Types.ObjectId.isValid(discussionId)) {
            return res.status(400).json({ error: 'Invalid discussion ID' });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        // Get parent replies first
        const replies = await Reply.find({ 
            discussion: discussionId, 
            parentReply: null 
        })
        .populate('author', 'name photoUrl role')
        .sort({ isAcceptedAnswer: -1, createdAt: 1 })
        .skip(skip)
        .limit(parseInt(limit));

        // Get nested replies for each parent reply
        const repliesWithNested = await Promise.all(
            replies.map(async (reply) => {
                const nestedReplies = await Reply.find({ parentReply: reply._id })
                    .populate('author', 'name photoUrl role')
                    .sort({ createdAt: 1 });
                
                return {
                    ...reply.toObject(),
                    replies: nestedReplies,
                    upvoteCount: reply.upvotes.length,
                    downvoteCount: reply.downvotes.length
                };
            })
        );

        const total = await Reply.countDocuments({ 
            discussion: discussionId, 
            parentReply: null 
        });

        res.json({
            replies: repliesWithNested,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / parseInt(limit)),
                total,
                limit: parseInt(limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Create new reply
export const createReply = async (req, res) => {
    try {
        const { discussionId } = req.params;
        const { content, parentReply } = req.body;
        const userId = req.id;

        if (!mongoose.Types.ObjectId.isValid(discussionId)) {
            return res.status(400).json({ error: 'Invalid discussion ID' });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Reply content is required' });
        }

        // Check if discussion exists and is not locked
        const discussion = await Discussion.findById(discussionId);
        if (!discussion) {
            return res.status(404).json({ error: 'Discussion not found' });
        }

        if (discussion.isLocked) {
            return res.status(403).json({ error: 'Cannot reply to locked discussion' });
        }

        // Validate parent reply if provided
        if (parentReply) {
            if (!mongoose.Types.ObjectId.isValid(parentReply)) {
                return res.status(400).json({ error: 'Invalid parent reply ID' });
            }
            
            const parentReplyExists = await Reply.findOne({
                _id: parentReply,
                discussion: discussionId
            });
            
            if (!parentReplyExists) {
                return res.status(404).json({ error: 'Parent reply not found' });
            }
        }

        // Check if user is instructor for this course
        const user = await User.findById(userId);
        const isInstructorReply = user.role === 'instructor';

        const reply = new Reply({
            content,
            author: userId,
            discussion: discussionId,
            parentReply: parentReply || null,
            isInstructorReply
        });

        await reply.save();
        
        // Populate author info for response
        await reply.populate('author', 'name photoUrl role');

        res.status(201).json({
            ...reply.toObject(),
            upvoteCount: 0,
            downvoteCount: 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update reply
export const updateReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid reply ID' });
        }

        if (!content || content.trim().length === 0) {
            return res.status(400).json({ error: 'Reply content is required' });
        }

        const reply = await Reply.findById(id);
        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        // Check if user is the author or an instructor
        if (reply.author.toString() !== userId && req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Not authorized to update this reply' });
        }

        reply.content = content;
        reply.isEdited = true;
        reply.editedAt = new Date();
        
        await reply.save();
        await reply.populate('author', 'name photoUrl role');

        res.json({
            ...reply.toObject(),
            upvoteCount: reply.upvotes.length,
            downvoteCount: reply.downvotes.length
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Delete reply
export const deleteReply = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid reply ID' });
        }

        const reply = await Reply.findById(id);
        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        // Check if user is the author or an instructor
        if (reply.author.toString() !== userId && req.user.role !== 'instructor') {
            return res.status(403).json({ error: 'Not authorized to delete this reply' });
        }

        // Delete nested replies first
        await Reply.deleteMany({ parentReply: id });
        
        // Delete the reply
        await Reply.findByIdAndDelete(id);

        res.json({ message: 'Reply deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Vote on reply (upvote/downvote)
export const voteReply = async (req, res) => {
    try {
        const { id } = req.params;
        const { voteType } = req.body; // 'upvote', 'downvote', or 'remove'
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid reply ID' });
        }

        if (!['upvote', 'downvote', 'remove'].includes(voteType)) {
            return res.status(400).json({ error: 'Invalid vote type' });
        }

        const reply = await Reply.findById(id);
        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        // Remove existing votes by this user
        reply.upvotes.pull(userId);
        reply.downvotes.pull(userId);

        // Add new vote if not removing
        if (voteType === 'upvote') {
            reply.upvotes.push(userId);
        } else if (voteType === 'downvote') {
            reply.downvotes.push(userId);
        }

        await reply.save();

        res.json({
            upvoteCount: reply.upvotes.length,
            downvoteCount: reply.downvotes.length,
            userVote: voteType === 'remove' ? null : voteType
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark reply as accepted answer (discussion author or instructor only)
export const markAsAcceptedAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid reply ID' });
        }

        const reply = await Reply.findById(id).populate('discussion');
        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        const discussion = reply.discussion;

        // Check if user is the discussion author or an instructor
        if (discussion.author.toString() !== userId && req.user.role !== 'instructor') {
            return res.status(403).json({ 
                error: 'Only the discussion author or instructors can mark accepted answers' 
            });
        }

        // Remove accepted answer from other replies in this discussion
        await Reply.updateMany(
            { discussion: discussion._id },
            { isAcceptedAnswer: false }
        );

        // Mark this reply as accepted answer
        reply.isAcceptedAnswer = true;
        await reply.save();

        // Mark discussion as answered
        await Discussion.findByIdAndUpdate(discussion._id, {
            isAnswered: true
        });

        res.json({ message: 'Reply marked as accepted answer' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove accepted answer status
export const removeAcceptedAnswer = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid reply ID' });
        }

        const reply = await Reply.findById(id).populate('discussion');
        if (!reply) {
            return res.status(404).json({ error: 'Reply not found' });
        }

        const discussion = reply.discussion;

        // Check if user is the discussion author or an instructor
        if (discussion.author.toString() !== userId && req.user.role !== 'instructor') {
            return res.status(403).json({ 
                error: 'Only the discussion author or instructors can remove accepted answers' 
            });
        }

        reply.isAcceptedAnswer = false;
        await reply.save();

        // Check if there are other accepted answers
        const hasOtherAcceptedAnswers = await Reply.exists({
            discussion: discussion._id,
            isAcceptedAnswer: true
        });

        // If no other accepted answers, mark discussion as unanswered
        if (!hasOtherAcceptedAnswers) {
            await Discussion.findByIdAndUpdate(discussion._id, {
                isAnswered: false
            });
        }

        res.json({ message: 'Accepted answer status removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};