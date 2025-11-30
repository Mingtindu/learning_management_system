// routes/forumRoutes.js
import express from "express";
import {
  createDiscussion,
  deleteDiscussion,
  getDiscussion,
  getDiscussions,
  getDiscussionStats,
  toggleLockDiscussion,
  togglePinDiscussion,
  updateDiscussion,
} from "../controllers/forum.controller.js";
import {
  createReply,
  deleteReply,
  getReplies,
  markAsAcceptedAnswer,
  removeAcceptedAnswer,
  updateReply,
  voteReply,
} from "../controllers/reply.controller.js";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import { Discussion } from "../models/forum.model.js";

const router = express.Router();

// Discussion routes
router.get("/discussions", getDiscussions);
router.get("/discussions/stats", getDiscussionStats);
router.get("/discussions/:id", getDiscussion);
router.post("/discussions", isAuthenticated, createDiscussion);
router.put("/discussions/:id", isAuthenticated, updateDiscussion);
router.delete("/discussions/:id", isAuthenticated, deleteDiscussion);
router.patch("/discussions/:id/pin", isAuthenticated, togglePinDiscussion);
router.patch("/discussions/:id/lock", isAuthenticated, toggleLockDiscussion);

// Reply routes
router.get("/discussions/:discussionId/replies", getReplies);
router.post("/discussions/:discussionId/replies", isAuthenticated, createReply);
router.put("/replies/:id", isAuthenticated, updateReply);
router.delete("/replies/:id", isAuthenticated, deleteReply);
router.post("/replies/:id/vote", isAuthenticated, voteReply);
router.patch("/replies/:id/accept", isAuthenticated, markAsAcceptedAnswer);
router.patch("/replies/:id/unaccept", isAuthenticated, removeAcceptedAnswer);

router.get("/categories", (req, res) => {
  const categories = ["Programming", "Web Design", "Career", "General"];
  res.json(categories);
});

router.get("/tags", async (req, res) => {
  try {
    const tags = await Discussion.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 50 },
    ]);
    res.json(tags.map((tag) => tag._id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
