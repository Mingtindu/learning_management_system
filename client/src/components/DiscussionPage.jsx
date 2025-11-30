import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MessageSquare,
  Clock,
  User,
  ChevronDown,
  Reply,
  Check,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Pin,
  Lock,
  Edit,
  Trash2,
  ChevronUp,
  ChevronDown as DownIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import axios from "axios";
import { BASE_URL } from "@/app/constant";
import { toast } from "sonner";

const DiscussionPage = () => {
  const { id, slug } = useParams();
  const navigate = useNavigate();

  // State management
  const [discussion, setDiscussion] = useState(null);
  const [replies, setReplies] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [replying, setReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.warn("No authentication token found");
      return {};
    }
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };
  // Fetch discussion and replies
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [discussionRes, repliesRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/v1/forum/discussions/${id}`),
          axios.get(`${BASE_URL}/api/v1/forum/discussions/${id}/replies`),
        ]);

        setDiscussion(discussionRes.data.discussion);

        // Handle case where replies might be null/undefined
        setReplies(repliesRes.data.replies || []); // Fallback to empty array
      } catch (err) {
        setError(err.response?.data?.error || "Failed to fetch discussion");
        console.error("Error fetching discussion:", err);

        // If discussion not found, redirect to forum
        if (err.response?.status === 404) {
          navigate("/forum", { replace: true });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  // Handle reply submission
  const handleReplySubmit = async (e) => {
    e.preventDefault();

    if (!replyContent.trim()) {
      toast.error("Reply content cannot be empty");
      return;
    }

    try {
      setReplying(true);
      setError(null);

      const response = await axios.post(
        `${BASE_URL}/api/v1/forum/discussions/${id}/replies`,
        { content: replyContent },
        { headers: getAuthHeaders() }
      );

      // Handle both possible response structures:
      const newReply = response.data?.reply || response.data;

      if (!newReply) {
        throw new Error("Invalid reply response from server");
      }

      setReplies((prev) => [newReply, ...prev]);
      setDiscussion((prev) => ({
        ...prev,
        repliesCount: (prev?.repliesCount || 0) + 1,
      }));

      setReplyContent("");
      toast.success("Your reply has been posted successfully!");
    } catch (err) {
      const errorMsg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        "Failed to post reply";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error posting reply:", err);
    } finally {
      setReplying(false);
    }
  };
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading discussion...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mx-auto max-w-2xl my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!discussion) {
    return (
      <div className="text-center py-12">
        <p>Discussion not found</p>
        <Button onClick={() => navigate("/forum")} className="mt-4">
          Back to Forum
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Discussion content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-8">
        <h1 className="text-2xl font-bold mb-4">{discussion.title}</h1>
        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: discussion.content }}
        />

        <div className="flex items-center justify-between mt-6 pt-4 border-t">
          <div className="text-sm text-gray-500">
            Posted by {discussion.author?.name || "Anonymous"} •{" "}
            {formatDate(discussion.createdAt)}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              <MessageSquare className="h-4 w-4 mr-1" />
              {discussion.repliesCount || 0} replies
            </Badge>
          </div>
        </div>
      </div>

      {/* Replies section */}
      <h2 className="text-xl font-semibold mb-4">
        {discussion.repliesCount || 0}{" "}
        {discussion.repliesCount === 1 ? "Reply" : "Replies"}
      </h2>

      {replies.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
          <MessageSquare className="mx-auto h-10 w-10 text-gray-400 mb-4" />
          <p>No replies yet. Be the first to respond!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {replies.map((reply) => (
            <div
              key={reply._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
            >
              <div className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={reply.author?.photoUrl} />
                  <AvatarFallback>
                    {reply.author?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium">
                      {reply.author?.name || "Anonymous"}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(reply.createdAt)}
                    </span>
                    {reply.isEdited && (
                      <span className="text-xs text-gray-500 italic">
                        (edited)
                      </span>
                    )}
                  </div>
                  <div className="prose dark:prose-invert">{reply.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply form */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-4">Post a Reply</h3>
        <form onSubmit={handleReplySubmit}>
          <Textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply here..."
            className="min-h-[150px] mb-4"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={replying}>
              {replying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Post Reply
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DiscussionPage;
