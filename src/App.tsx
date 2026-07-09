import React, { useState, useRef, useTransition } from 'react';
import { CelebrationPost, CardConfig } from './types';
import { CelebrationWall } from './components/CelebrationWall';
import { CardGenerator } from './components/CardGenerator';
import { FireworksCanvas, FireworksCanvasHandle } from './components/FireworksCanvas';
import { sound } from './utils/audio';
import { Sparkles, Award, Star, Share2, Volume2, Music, GraduationCap, Heart, FileText, ArrowLeft, Trophy } from 'lucide-react';

const INITIAL_POSTS: CelebrationPost[] = [
  {
    id: 'post-1',
    studentName: 'نور الايمان لؤي عبدالله ابراهيم',
    score: '172.5',
    grade: 'شهادة التعليم المتوسط',
    senderName: 'الوالد العزيز والعائلة الكريمة',
    message: 'حبيبة قلوبنا وقرة أعيننا "نور الايمان"، فخورون بكِ وبنجاحكِ الباهر والمشرف في امتحانات شهادة التعليم المتوسط لولاية الجزيرة بمجموع 172.5! سهرتِ الليالي واجتهدتِ، واليوم تشرق البسمة في وجوهنا جميعاً. نسأل الله لكِ دوام التفوق والسعادة والمستقبل الباهر المشرق.',
    templateId: 'sudanese-heritage',
    likes: 124,
    commentsCount: 2,
    createdAt: 'منذ ساعتين'
  },
  {
    id: 'post-2',
    studentName: 'نهال البشير محمد علي',
    score: '96.5%',
    grade: 'الشهادة الثانوية السودانية',
    senderName: 'الخال مأمون وجميع الأهل',
    message: 'يسرنا أن نزف أطيب وأرق التهاني والتبريكات للإبنة "نهال البشير" بمناسبة حصولها على المجموع الاستثنائي 96.5% في الشهادة الثانوية. لقد كنت دائماً رمزاً للمثابرة والأخلاق العالية، وها قد رفعت رأساً عالياً وشققت درب المعالي بفخر واعتزاز.',
    templateId: 'royal-gold',
    likes: 98,
    commentsCount: 1,
    createdAt: 'منذ 5 ساعات'
  },
  {
    id: 'post-3',
    studentName: 'تسنيم مأمون التاج',
    score: '265',
    grade: 'شهادة التعليم المتوسط',
    senderName: 'المعلمة نعمات وزميلات الصف',
    message: 'إلى تلميذتنا النجيبة وطالبتنا المتميزة "تسنيم مأمون التاج"، نبارك لكِ هذا التفوق الكاسح والمجموع الباهر 265 من 280 في امتحانات شهادة المتوسط. كنتِ شعلة من النشاط والذكاء طوال العام الدراسي، واليوم نتوج جهدكِ بأكاليل الفخر والذهب.',
    templateId: 'festive-joy',
    likes: 76,
    commentsCount: 1,
    createdAt: 'منذ يوم واحد'
  },
  {
    id: 'post-4',
    studentName: 'غنا عوض الجاز',
    score: '248',
    grade: 'شهادة التعليم الابتدائي',
    senderName: 'الوالدة الغالية',
    message: 'مبروك يا حبيبة والدتك "غنا عوض"! كلووولووووللي! نجاحك اليوم في شهادة الابتدائي بمجموع 248 هو أسعد خبر ملا بيتنا فرح وهناء وعقبال تفوق الشهادة المتوسطة والثانوية دايماً في الصدارة.',
    templateId: 'modern-gradient',
    likes: 112,
    commentsCount: 0,
    createdAt: 'منذ يومين'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'wall' | 'generator'>('wall');
  const [posts, setPosts] = useState<CelebrationPost[]>(INITIAL_POSTS);
  const [generatorPreFill, setGeneratorPreFill] = useState<Partial<CardConfig> | undefined>(undefined);
  const [musicPlaying, setMusicPlaying] = useState(false);

  const fireworksRef = useRef<FireworksCanvasHandle | null>(null);

  const [isPending, startTransition] = useTransition();

  // Trigger celebration firework bursts
  const triggerFireworks = () => {
    if (fireworksRef.current) {
      fireworksRef.current.launchBatch(8);
    }
  };

  // Sound triggers
  const playCelebrateSound = () => {
    sound.playFanfare();
    sound.playApplause();
    triggerFireworks();
  };

  const handleLikePost = (id: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked,
            }
          : post
      )
    );
  };

  const handleAddComment = (id: string, text: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? {
              ...post,
              commentsCount: post.commentsCount + 1,
            }
          : post
      )
    );
  };

  // Pre-fill card creator using post details from celebration wall
  const handleSelectPostForCard = (post: CelebrationPost) => {
    setGeneratorPreFill({
      studentName: post.studentName,
      score: post.score,
      grade: post.grade,
      senderName: post.senderName,
      customMessage: post.message,
      templateId: post.templateId,
      gender: post.studentName.includes('ة') || post.studentName.includes('نور') ? 'female' : 'male',
    });
    startTransition(() => {
      setActiveTab('generator');
    });
    sound.playPop();
  };

  // Save customized card back to the live wall feed
  const handleSaveCardToWall = (config: CardConfig) => {
    const newPost: CelebrationPost = {
      id: `post-${Date.now()}`,
      studentName: config.studentName,
      score: config.score,
      grade: config.grade,
      senderName: config.senderName,
      message: config.customMessage || `ألف مبروك النجاح والتفوق الباهر لـ "${config.studentName}" وعقبال دوام المراتب العليا!`,
      templateId: config.templateId,
      likes: 1,
      commentsCount: 0,
      createdAt: 'الآن'
    };

    setPosts([newPost, ...posts]);
    startTransition(() => {
      setActiveTab('wall');
    });
  };

  const handleTabChange = (tab: 'wall' | 'generator') => {
    startTransition(() => {
      setActiveTab(tab);
    });
    sound.playPop();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 via-amber-50/20 to-neutral-50 text-neutral-800 font-sans relative overflow-x-hidden pb-16">
      
      {/* Interactive Fireworks Canvas Overlay */}
      <FireworksCanvas ref={fireworksRef} />

      {/* Hero Banner Area */}
      <header className="relative bg-neutral-900 text-white overflow-hidden border-b border-amber-500/20 shadow-2xl py-8 md:py-12" dir="rtl">
        {/* Soft background light */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.15)_0%,transparent_70%)] pointer-events-none" />
        {/* Subtle geometric pattern */}
        <div className="absolute inset-0 opacity-10 heritage-pattern pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo & Platform Info */}
          <div className="text-center md:text-right flex flex-col gap-2">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <span className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-500/5 animate-pulse">
                <Trophy className="w-8 h-8" />
              </span>
              <div>
                <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight font-kufi flex items-center gap-2">
                  منصّة <span className="text-amber-400">تهانِي النجاح</span> الباهر
                </h1>
                <p className="text-xs md:text-sm text-neutral-400 font-medium mt-1">
                  شارك الفرحة وصمم بطاقات التهنئة بتفوق الطلاب والشهادات التعليمية بالذكاء الاصطناعي
                </p>
              </div>
            </div>

            {/* Custom note highlighting Sudan / Gezira State compatibility */}
            <div className="mt-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl px-3.5 py-2 inline-flex items-center gap-2 text-xs text-amber-300 self-center md:self-start">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>متوافق كلياً مع نتائج **شهادة التعليم المتوسط لولاية الجزيرة 2025-2026** وجميع الشهادات السودانية والعربية!</span>
            </div>
          </div>

          {/* Interactive Controls on Banner */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={playCelebrateSound}
              className="px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-neutral-950 font-black text-xs md:text-sm flex items-center gap-2.5 transition-all transform hover:scale-105 shadow-xl shadow-amber-500/10 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-neutral-950 animate-spin" style={{ animationDuration: '3s' }} />
              أطلق ألعاب نارية احتفالية! 🎉
            </button>
            <button
              onClick={() => {
                sound.playApplause();
                sound.playPop();
                triggerFireworks();
              }}
              className="px-5 py-3 rounded-2xl bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs md:text-sm flex items-center gap-2.5 transition-all border border-neutral-700 cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              مؤثرات صوتية 🔊
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 mt-8 md:mt-12" dir="rtl">
        
        {/* Navigation Tabs Bar */}
        <div className="flex border-b border-neutral-200/80 mb-8 max-w-md mx-auto bg-neutral-100 p-1.5 rounded-2xl shadow-inner">
          <button
            onClick={() => handleTabChange('wall')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'wall'
                ? 'bg-white text-neutral-900 shadow-md scale-102'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Star className="w-4 h-4 text-amber-500" />
            جدار المباركات العامة 🌟
          </button>
          <button
            onClick={() => handleTabChange('generator')}
            className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all flex items-center justify-center gap-2 ${
              activeTab === 'generator'
                ? 'bg-white text-neutral-900 shadow-md scale-102'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-amber-500" />
            مصمم البطاقات بالذكاء الاصطناعي ✨
          </button>
        </div>

        {/* Dynamic Tab Rendering with Framer Motion or clean React state */}
        <div className="transition-all duration-300">
          {isPending ? (
            <div className="text-center py-24">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-neutral-500 font-medium">جاري الانتقال والتحميل...</p>
            </div>
          ) : activeTab === 'wall' ? (
            <CelebrationWall
              posts={posts}
              onLike={handleLikePost}
              onAddComment={handleAddComment}
              onSelectPost={handleSelectPostForCard}
              triggerFireworks={triggerFireworks}
            />
          ) : (
            <CardGenerator
              initialConfig={generatorPreFill}
              onSaveCard={handleSaveCardToWall}
              onBackToWall={() => handleTabChange('wall')}
              triggerFireworks={triggerFireworks}
            />
          )}
        </div>

      </main>

      {/* Floating Audio Playback Controls in Bottom Left */}
      <div className="fixed bottom-6 left-6 z-50">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-3 shadow-2xl border border-neutral-100 flex items-center gap-3">
          <button
            onClick={() => {
              sound.playFanfare();
              sound.playApplause();
              triggerFireworks();
            }}
            title="شغّل أنشودة النجاح وصوت التشجيع"
            className="w-10 h-10 rounded-xl bg-amber-500 hover:bg-amber-600 text-neutral-950 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
          >
            <Volume2 className="w-5 h-5" />
          </button>
          <div className="text-right pl-2 hidden sm:block">
            <div className="text-[10px] font-bold text-neutral-500">جرب المؤثرات الصوتية:</div>
            <div className="text-xs font-extrabold text-neutral-800">زغاريد النجاح وتشجيع الجمهور!</div>
          </div>
        </div>
      </div>

    </div>
  );
}
