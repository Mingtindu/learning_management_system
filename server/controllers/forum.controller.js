import mongoose from "mongoose";
import { Course } from "../models/course.model.js";
import { Discussion, Reply } from "../models/forum.model.js";
import slugify from "slugify";

// Get all discussions with filters and pagination
export const getDiscussions = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      category,
      course,
      tags,
      sort = "recent",
      unanswered,
    } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (category && category !== "All") {
      filter.category = category;
    }

    if (course && course !== "All") {
      filter.course = course;
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      filter.tags = { $in: tagArray };
    }

    if (unanswered === "true") {
      filter.isAnswered = false;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case "replies":
        sortObj = { repliesCount: -1 };
        break;
      case "views":
        sortObj = { views: -1 };
        break;
      case "oldest":
        sortObj = { createdAt: 1 };
        break;
      default: // 'recent'
        sortObj = { isPinned: -1, lastActivity: -1 };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const discussions = await Discussion.find(filter)
      .populate("author", "name photoUrl role")
      .populate("course", "title")
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await Discussion.countDocuments(filter);

    res.json({
      discussions,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total,
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single discussion with replies
export const getDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid discussion ID" });
    }

    // Increment view count
    await Discussion.findByIdAndUpdate(id, { $inc: { views: 1 } });

    const discussion = await Discussion.findById(id)
      .populate("author", "name photoUrl role")
      .populate("course", "title");

    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    // Get replies with nested structure
    const replies = await Reply.find({ discussion: id, parentReply: null })
      .populate("author", "name photoUrl role")
      .populate({
        path: "parentReply",
        populate: { path: "author", select: "name photoUrl role" },
      })
      .sort({ createdAt: 1 });

    // Get nested replies for each parent reply
    const repliesWithNested = await Promise.all(
      replies.map(async (reply) => {
        const nestedReplies = await Reply.find({ parentReply: reply._id })
          .populate("author", "name photoUrl role")
          .sort({ createdAt: 1 });

        return {
          ...reply.toObject(),
          replies: nestedReplies,
        };
      })
    );

    res.json({
      discussion,
      replies: repliesWithNested,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new discussion
export const createDiscussion = async (req, res) => {
  try {
    const { title, content, course, category, tags } = req.body;
    console.log(course);
    const userId = req.id;

    // Validate required fields
    if (!title || !content || !course || !category) {
      return res.status(400).json({
        error: "Title, content, course, and category are required",
      });
    }

    // Verify course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ error: "Course not found" });
    }

    let baseSlug = slugify(title, { lower: true, strict: true });
    let slug = baseSlug;
    let count = 1;
    while (await Discussion.findOne({ slug })) {
      slug = `${baseSlug}-${count++}`;
    }

    const discussion = new Discussion({
      title,
      content,
      author: userId,
      slug,
      course,
      category,
      tags: tags || [],
    });

    await discussion.save();

    // Populate author and course info for response
    await discussion.populate("author", "name photoUrl role");
    await discussion.populate("course", "title");

    res.status(201).json(discussion);
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      res
        .status(400)
        .json({ error: "A discussion with this title already exists" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

// Update discussion
export const updateDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, category, tags } = req.body;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    // Check if user is the author or an instructor
    if (
      discussion.author.toString() !== userId &&
      req.user.role !== "instructor"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this discussion" });
    }

    const updatedDiscussion = await Discussion.findByIdAndUpdate(
      id,
      { title, content, category, tags },
      { new: true, runValidators: true }
    )
      .populate("author", "name photoUrl role")
      .populate("course", "title");

    res.json(updatedDiscussion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete discussion
export const deleteDiscussion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    // Check if user is the author or an instructor
    if (
      discussion.author.toString() !== userId &&
      req.user.role !== "instructor"
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this discussion" });
    }

    // Delete all replies first
    await Reply.deleteMany({ discussion: id });

    // Delete the discussion
    await Discussion.findByIdAndDelete(id);

    res.json({ message: "Discussion deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Pin/Unpin discussion (instructors only)
export const togglePinDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ error: "Only instructors can pin discussions" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json({
      message: `Discussion ${
        discussion.isPinned ? "pinned" : "unpinned"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Lock/Unlock discussion (instructors only)
export const toggleLockDiscussion = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user.role !== "instructor") {
      return res
        .status(403)
        .json({ error: "Only instructors can lock discussions" });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid discussion ID" });
    }

    const discussion = await Discussion.findById(id);
    if (!discussion) {
      return res.status(404).json({ error: "Discussion not found" });
    }

    discussion.isLocked = !discussion.isLocked;
    await discussion.save();

    res.json({
      message: `Discussion ${
        discussion.isLocked ? "locked" : "unlocked"
      } successfully`,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get discussion statistics
export const getDiscussionStats = async (req, res) => {
  try {
    const totalDiscussions = await Discussion.countDocuments();
    const answeredDiscussions = await Discussion.countDocuments({
      isAnswered: true,
    });
    const unansweredDiscussions = totalDiscussions - answeredDiscussions;

    const categoryStats = await Discussion.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    const popularTags = await Discussion.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      total: totalDiscussions,
      answered: answeredDiscussions,
      unanswered: unansweredDiscussions,
      byCategory: categoryStats,
      popularTags,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
