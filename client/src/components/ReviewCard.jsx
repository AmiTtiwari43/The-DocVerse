import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useAppContext } from '../context/AppContext';
import { useToast } from './ui/use-toast';
import api from '../utils/api';
import { MessageCircle, Reply, User, Calendar, ThumbsUp, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

const ReviewCard = ({ review, onReplyAdded }) => {
  const { user } = useAppContext();
  const { toast } = useToast();
  const [showDoctorReplyForm, setShowDoctorReplyForm] = useState(false);
  const [showUserReplyForm, setShowUserReplyForm] = useState(false);
  const [doctorReplyText, setDoctorReplyText] = useState('');
  const [userReplyText, setUserReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null); // ID of the reply being replied to
  const [loading, setLoading] = useState(false);
  const [likes, setLikes] = useState(review.likes || []);
  const [liking, setLiking] = useState(false);

  const hasLiked = likes.includes(user?.id);

  const handleDoctorReply = async () => {
    if (!doctorReplyText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Reply cannot be empty',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/reviews/${review._id}/doctor-reply`, {
        reply: doctorReplyText,
      });

      if (response.data.success) {
        setDoctorReplyText('');
        setShowDoctorReplyForm(false);
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Reply added successfully',
        });
        onReplyAdded && onReplyAdded();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Error adding reply',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUserReply = async () => {
    if (!userReplyText.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Reply cannot be empty',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(`/reviews/${review._id}/user-reply`, {
        reply: userReplyText,
        parentId: replyingTo,
      });

      if (response.data.success) {
        setUserReplyText('');
        setReplyingTo(null);
        setShowUserReplyForm(false);
        toast({
          variant: 'success',
          title: 'Success',
          description: 'Reply added successfully',
        });
        onReplyAdded && onReplyAdded();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Error adding reply',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please login to like reviews',
      });
      return;
    }

    setLiking(true);
    try {
      if (hasLiked) {
        const response = await api.post(`/reviews/${review._id}/unlike`);
        if (response.data.success) {
          setLikes(response.data.data.likes);
          toast({
            variant: 'success',
            title: 'Success',
            description: 'Like removed',
          });
        }
      } else {
        const response = await api.post(`/reviews/${review._id}/like`);
        if (response.data.success) {
          setLikes(response.data.data.likes);
          toast({
            variant: 'success',
            title: 'Success',
            description: 'Review liked',
          });
        }
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Error updating like',
      });
    } finally {
      setLiking(false);
    }
  };

  const handleDeleteReview = async () => {
      try {
        const response = await api.delete(`/reviews/${review._id}`);
        if (response.data.success) {
          toast({
            variant: "success",
            title: "Success",
            description: "Review deleted successfully",
          });
          onReplyAdded && onReplyAdded(); // Refresh list
        }
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.response?.data?.message || "Error deleting review",
        });
      }
  };

  const handleDeleteDoctorReply = async () => {
    try {
      const response = await api.delete(`/reviews/${review._id}/doctor-reply`);
      if (response.data.success) {
        toast({
          variant: "success",
          title: "Success",
          description: "Reply deleted successfully",
        });
        onReplyAdded && onReplyAdded();
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error deleting reply",
      });
    }
  };

  const handleDeleteUserReply = async (replyId) => {
    try {
      const response = await api.delete(`/reviews/${review._id}/user-reply/${replyId}`);
      if (response.data.success) {
        toast({
          variant: "success",
          title: "Success",
          description: "Reply deleted successfully",
        });
        onReplyAdded && onReplyAdded();
      }
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Error deleting reply",
      });
    }
  };



  const organizeReplies = (replies) => {
    if (!replies) return [];
    const sorted = [...replies].sort((a, b) => new Date(a.replyDate) - new Date(b.replyDate));
    
    // Filter orphans: Only keep replies whose parentId exists in the list or is null
    const idSet = new Set(sorted.map(r => r._id));
    const validReplies = sorted.filter(r => !r.parentId || idSet.has(r.parentId));
    
    // Double check: if parent is an orphan (filtered out), child should arguably be filtered too. 
    // Ideally we build a tree. For now, simple filter is better than nothing, 
    // but recursive validity check is best.
    
    // Let's implement a reachability check.
    const nodes = {};
    sorted.forEach(r => nodes[r._id] = { ...r, children: [] });
    const roots = [];
    
    sorted.forEach(r => {
      if (r.parentId && nodes[r.parentId]) {
        nodes[r.parentId].children.push(nodes[r._id]);
      } else if (!r.parentId) {
        roots.push(nodes[r._id]);
      }
    });

    // Flatten valid nodes
    const flatten = (node) => [node, ...node.children.flatMap(flatten)];
    const valid = roots.flatMap(flatten);
    
    return valid;
  };
  
  const allReplies = organizeReplies(review.userReplies);

  const ReplyItem = ({ reply, depth = 0 }) => {
    const childReplies = allReplies.filter(r => r.parentId === reply._id);
    const isReplying = replyingTo === reply._id;

    return (
      <div className={`mt-2 ${depth > 0 ? 'ml-6 pl-2 border-l-2 border-slate-200 dark:border-slate-700' : ''}`}>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-3 group relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-foreground">{reply.userId?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">
                {reply.replyDate && format(new Date(reply.replyDate), 'MMM d, yyyy')}
              </p>
            </div>
            <div className="flex items-center gap-2">
                {/* Like Button for User Reply */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`h-5 w-5 ${reply.likes?.includes(user?.id) ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                  onClick={() => handleLikeUserReply(reply._id, reply.likes?.includes(user?.id))}
                >
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                {reply.likes?.length > 0 && (
                  <span className="text-xs text-slate-500">{reply.likes.length}</span>
                )}
                
                {/* Reply to User Reply */}
                 {user && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-slate-400 hover:text-blue-600"
                    onClick={() => {
                        if (replyingTo === reply._id) {
                            setReplyingTo(null);
                            setShowUserReplyForm(false);
                        } else {
                            setReplyingTo(reply._id);
                            setShowUserReplyForm(true);
                            setUserReplyText(`@${reply.userId?.name || 'User'} `);
                        }
                    }}
                  >
                    <Reply className="h-3 w-3" />
                  </Button>
                 )}

              {(user?.id === reply.userId?._id || user?.role === 'admin') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-red-500">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                    <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Reply?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this reply?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                      <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDeleteUserReply(reply._id)} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
          <p className="text-sm text-foreground mt-2">{reply.reply}</p>
        </div>

        {/* Reply Form for this specific reply */}
        {isReplying && showUserReplyForm && (
            <div className="mt-2 ml-4">
               {/* Re-using the same form UI but positioned here */}
                 <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4">
                  <div className="space-y-2">
                    <Input
                      placeholder="Write your reply..."
                      value={userReplyText}
                      onChange={(e) => setUserReplyText(e.target.value)}
                      className="text-sm"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={handleUserReply}
                        disabled={loading}
                      >
                        {loading ? 'Sending...' : 'Send'}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                            setReplyingTo(null);
                            setShowUserReplyForm(false);
                            setUserReplyText('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
            </div>
        )}

        {/* Render Children */}
        {childReplies.map(child => (
            <ReplyItem key={child._id} reply={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  const handleLikeDoctorReply = async () => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please login to like' });
      return;
    }
    try {
      const isLiked = review.doctorReplyLikes?.includes(user.id);
      const endpoint = isLiked ? `/reviews/${review._id}/doctor-reply/unlike` : `/reviews/${review._id}/doctor-reply/like`;
      
      const response = await api.post(endpoint);
      if (response.data.success) {
        onReplyAdded && onReplyAdded();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Error updating like',
      });
    }
  };

  const handleLikeUserReply = async (replyId, isLiked) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please login to like' });
      return;
    }
    try {
      const endpoint = isLiked 
        ? `/reviews/${review._id}/user-reply/${replyId}/unlike` 
        : `/reviews/${review._id}/user-reply/${replyId}/like`;
      
      const response = await api.post(endpoint);
      if (response.data.success) {
        onReplyAdded && onReplyAdded();
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.response?.data?.message || 'Error updating like',
      });
    }
  };

  return (
    <Card className="p-4 mb-4 bg-card">
      <div className="space-y-4">
        {/* Review Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <h4 className="font-semibold text-sm">
                  {review.isAnonymous ? 'Anonymous Patient' : review.patientId?.name}
                </h4>
              </div>
               <div className="flex items-center gap-2">
                {review.isRecommended && (
                  <div className="flex items-center gap-1 text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full border border-green-200">
                    <CheckCircle className="h-3 w-3" />
                    Recommended
                  </div>
                )}
                {/* Delete Review Button */}
                {/* Delete Review Button */}
                 {(user?.id === (review.patientId?._id || review.patientId) || user?.role === 'admin') && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-red-500">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Review?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your review.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteReview} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
               </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
              <Calendar className="h-3 w-3" />
              {review.createdAt && format(new Date(review.createdAt), 'MMM d, yyyy')}
            </div>

            {/* Review Title */}
            {review.title && (
              <h3 className="font-bold text-base mb-1">{review.title}</h3>
            )}

            {/* Overall Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg leading-none ${i < review.rating ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}>
                    ★
                  </span>
                ))}
              </div>
              <span className="text-sm font-semibold">{review.rating}/5</span>
            </div>

            {/* Detailed Ratings */}
            {review.detailedRatings && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 mb-3 bg-muted/30 p-2 rounded-md text-xs">
                {review.detailedRatings.waitTime > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Wait Time:</span>
                    <span className="font-medium">{review.detailedRatings.waitTime}/5</span>
                  </div>
                )}
                {review.detailedRatings.bedsideManner > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Bedside Manner:</span>
                    <span className="font-medium">{review.detailedRatings.bedsideManner}/5</span>
                  </div>
                )}
                {review.detailedRatings.staffFriendliness > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-muted-foreground">Staff:</span>
                    <span className="font-medium">{review.detailedRatings.staffFriendliness}/5</span>
                  </div>
                )}
              </div>
            )}

            {/* Review Comment */}
            <p className="text-sm text-foreground mt-2 leading-relaxed">{review.comment}</p>
          </div>
        </div>

        {/* Doctor Reply */}
        {review.doctorReply && (
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-3 ml-8 relative group">
            <div className="flex justify-between items-start">
                 <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">Doctor's Reply</div>
                 <div className="flex items-center gap-2">
                   {/* Like Button for Doctor Reply */}
                   <Button
                      variant="ghost"
                      size="icon"
                      className={`h-5 w-5 ${review.doctorReplyLikes?.includes(user?.id) ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'}`}
                      onClick={handleLikeDoctorReply}
                   >
                      <ThumbsUp className="h-3 w-3" />
                   </Button>
                   {review.doctorReplyLikes?.length > 0 && (
                      <span className="text-xs text-slate-500">{review.doctorReplyLikes.length}</span>
                   )}

                   {(user?.id === review.doctorId?.userId || user?.role === 'admin') && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-5 w-5 text-slate-400 hover:text-red-500">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Reply?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete your reply?
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteDoctorReply} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                   )}
                 </div>
            </div>
            <p className="text-sm text-foreground">{review.doctorReply}</p>
            {review.replyDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {format(new Date(review.replyDate), 'MMM d, yyyy')}
              </p>
            )}
          </div>
        )}

        {/* User Replies */}
        {review.userReplies && review.userReplies.length > 0 && (
          <div className="space-y-2 ml-8">
            <div className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {allReplies.length} {allReplies.length === 1 ? 'Reply' : 'Replies'}
            </div>
             {allReplies.filter(r => !r.parentId).map((reply) => (
                <ReplyItem key={reply._id} reply={reply} />
             ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2 flex-wrap items-center">
          {/* Like Button */}
          <Button
            size="sm"
            variant={hasLiked ? 'default' : 'outline'}
            onClick={handleLike}
            disabled={liking || !user}
            className={hasLiked ? 'bg-red-500 hover:bg-red-600' : 'gap-1'}
          >
            <ThumbsUp className={`h-3 w-3 ${hasLiked ? 'fill-current' : ''}`} />
            {likes.length > 0 && <span className="text-xs">{likes.length}</span>}
          </Button>

          {/* Doctor Reply Button */}
          {user?.role === 'doctor' && !review.doctorReply && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowDoctorReplyForm(!showDoctorReplyForm)}
              className="gap-1"
            >
              <Reply className="h-3 w-3" />
              Reply as Doctor
            </Button>
          )}

          {/* User Reply Button (Available to everyone) - Top Level */}
          {user && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                  setReplyingTo(null); // Explicitly clear replyingTo for top level
                  setShowUserReplyForm(!showUserReplyForm);
                  if (!showUserReplyForm) setUserReplyText('');
              }}
              className="gap-1"
            >
              <MessageCircle className="h-3 w-3" />
              Reply
            </Button>
          )}
        </div>

        {/* Doctor Reply Form */}
        {showDoctorReplyForm && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-lg p-4 ml-8">
            <div className="space-y-2">
              <Input
                placeholder="Write your reply..."
                value={doctorReplyText}
                onChange={(e) => setDoctorReplyText(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleDoctorReply}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Sending...' : 'Send'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowDoctorReplyForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* User Reply Form - Top Level */}
        {showUserReplyForm && !replyingTo && (
          <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg p-4 ml-8">
            <div className="space-y-2">
              <Input
                placeholder="Write your reply..."
                value={userReplyText}
                onChange={(e) => setUserReplyText(e.target.value)}
                className="text-sm"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleUserReply}
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send'}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowUserReplyForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ReviewCard;
