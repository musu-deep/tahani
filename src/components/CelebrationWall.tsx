import React, { useState, useTransition } from 'react';
import { CelebrationPost } from '../types';
import { Heart, MessageCircle, Sparkles, Star, Search, Award, GraduationCap, MapPin } from 'lucide-react';
import { sound } from '../utils/audio';

interface CelebrationWallProps {
  posts: CelebrationPost[];
  onLike: (id: string) => void;
  onAddComment: (id: string, text: string) => void;
  onSelectPost: (post: CelebrationPost) => void;
  triggerFireworks: () => void;
}

export const CelebrationWall: React.FC<CelebrationWallProps> = ({
  posts,
  onLike,
  onAddComment,
  onSelectPost,
  triggerFireworks
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('all');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  
  // Local comments store (just to let the user see their live additions!)
  const [postComments, setPostComments] = useState<Record<string, string[]>>({
    'post-1': ['ما شاء الله تفوق باهر يستحق الاحتفاء وعقبال الدكتوراة!', 'مبروك لولاية الجزيرة هذا التميز الإبداعي!'],
    'post-2': ['ألف مبروك يا مازن، رفعت رأس السودان والولاية عالياً!', 'تعب الوالدين تكلل بالذهب اليوم.'],
    'post-3': ['كلووووللووووي! ألف مبروك يا تسنيم الغالية الحبيبة! 🎉✨'],
  });

  const [isPending, startTransition] = useTransition();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    startTransition(() => {
      setSearchTerm(value);
    });
  };

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterGrade === 'all') return matchesSearch;
    return matchesSearch && post.grade === filterGrade;
  });

  const handleLikeClick = (id: string) => {
    onLike(id);
    sound.playPop();
    triggerFireworks();
  };

  const handleCommentSubmit = (postId: string, e: React.FormEvent) => {
    e.preventDefault();
    const commentText = commentInputs[postId]?.trim();
    if (!commentText) return;

    setPostComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), commentText],
    }));
    
    onAddComment(postId, commentText);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    sound.playPop();
  };

  return (
    <div className="w-full" dir="rtl">
      {/* Search and Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-md border border-neutral-100 mb-8">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
            <input
              type="text"
              placeholder="ابحث باسم الطالب، الولاية أو كاتب التهنئة..."
              defaultValue={searchTerm}
              onChange={handleSearchChange}
              className="w-full pl-4 pr-11 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm font-sans transition-all text-neutral-800"
            />
          </div>

          {/* Category Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center w-full md:w-auto">
            {[
              { id: 'all', label: 'الكل' },
              { id: 'شهادة التعليم المتوسط', label: 'التعليم المتوسط 🎓' },
              { id: 'الشهادة الثانوية', label: 'الشهادة الثانوية 🌟' },
              { id: 'المرحلة الابتدائية', label: 'الابتدائية 🎒' },
              { id: 'التعليم الجامعي', label: 'الجامعي 🏛️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterGrade(tab.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  filterGrade === tab.id
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Wall Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => {
          const comments = postComments[post.id] || [];
          
          return (
            <div 
              key={post.id}
              className="bg-white rounded-2xl shadow-lg border border-neutral-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
            >
              {/* Header */}
              <div className="p-5 border-b border-neutral-50 bg-gradient-to-l from-amber-50/20 to-transparent">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-neutral-900 group-hover:text-amber-600 transition-colors text-lg flex items-center gap-1.5">
                      <GraduationCap className="w-5 h-5 text-amber-500" />
                      {post.studentName}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                      <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">
                        {post.grade || 'التعليم المتوسط'}
                      </span>
                      {post.score && (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-0.5">
                          <Award className="w-3 h-3 text-emerald-500" />
                          مجموع: {post.score}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Firework Trigger Button */}
                  <button
                    onClick={() => {
                      sound.playFanfare();
                      triggerFireworks();
                    }}
                    title="أطلق ألعاب نارية احتفالاً!"
                    className="p-2 rounded-full bg-amber-50 text-amber-600 hover:bg-amber-100 transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Message Content */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div className="relative">
                  {/* Visual quote accent */}
                  <span className="absolute -top-3 -right-2 text-6xl text-neutral-100 font-serif select-none pointer-events-none">”</span>
                  <p className="text-neutral-700 text-sm leading-relaxed whitespace-pre-wrap relative z-10 font-sans pl-2">
                    {post.message}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-neutral-100/60 flex justify-between items-center text-xs text-neutral-500">
                  <div className="flex items-center gap-1">
                    <span className="font-medium text-neutral-700">{post.senderName}</span>
                    <span>•</span>
                    <span>{post.createdAt}</span>
                  </div>
                  
                  {/* State badge */}
                  <span className="text-neutral-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-neutral-400" />
                    الجزيرة
                  </span>
                </div>
              </div>

              {/* Interaction Bar */}
              <div className="px-5 py-3.5 bg-neutral-50/80 border-t border-neutral-100 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  
                  {/* Like button */}
                  <button
                    onClick={() => handleLikeClick(post.id)}
                    className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                      post.isLiked 
                        ? 'text-rose-600 scale-110' 
                        : 'text-neutral-500 hover:text-rose-600'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-rose-600' : ''}`} />
                    <span>{post.likes}</span>
                  </button>

                  {/* Comments toggle button */}
                  <button
                    onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                    className="flex items-center gap-1.5 text-xs text-neutral-500 hover:text-amber-600 font-bold"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{comments.length}</span>
                  </button>
                </div>

                {/* Open in Custom Card Generator Button */}
                <button
                  onClick={() => onSelectPost(post)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 bg-amber-50 hover:bg-amber-100/80 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Star className="w-3.5 h-3.5 text-amber-500" />
                  صمم بطاقة له
                </button>
              </div>

              {/* Comments Section */}
              {activeCommentsPostId === post.id && (
                <div className="bg-neutral-100/50 px-5 py-4 border-t border-neutral-100 text-right animate-fadeIn">
                  <h4 className="text-xs font-bold text-neutral-600 mb-2">التعليقات والمباركات ({comments.length}):</h4>
                  
                  {/* Comments list */}
                  {comments.length > 0 ? (
                    <div className="space-y-2 mb-3 max-h-[120px] overflow-y-auto">
                      {comments.map((comment, i) => (
                        <div key={i} className="text-xs text-neutral-700 bg-white p-2.5 rounded-xl border border-neutral-100 shadow-sm leading-relaxed">
                          {comment}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-400 mb-3 italic">كن أول من يكتب تبريكة لهذا التفوق...</p>
                  )}

                  {/* Add comment form */}
                  <form onSubmit={(e) => handleCommentSubmit(post.id, e)} className="flex gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="اكتب تبريكة أو دعاء جميل..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 text-neutral-800"
                    />
                    <button
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-colors"
                    >
                      إرسال
                    </button>
                  </form>
                </div>
              )}
            </div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="col-span-full text-center py-12 bg-white/55 backdrop-blur rounded-2xl border border-neutral-100">
            <div className="text-amber-500 mb-2 font-bold text-lg">لم يتم العثور على تهاني تطابق البحث</div>
            <p className="text-neutral-500 text-sm">كن أول من ينشر تهنئة لطالب متميز الآن!</p>
          </div>
        )}
      </div>
    </div>
  );
};
