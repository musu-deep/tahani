import React from 'react';
import { CardTemplate, CardConfig } from '../types';
import { Award, GraduationCap, Star, Sparkles, Heart, Landmark, Check } from 'lucide-react';

export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'royal-gold',
    name: 'Royal Gold',
    nameAr: 'الذهبي الملكي الفاخر',
    bgClass: 'bg-gradient-to-br from-neutral-950 via-neutral-900 to-amber-950/40',
    cardBgClass: 'bg-neutral-900/90 border border-amber-500/30 shadow-amber-500/10',
    borderClass: 'border-2 border-amber-400',
    textPrimaryClass: 'text-amber-100 font-serif',
    textSecondaryClass: 'text-amber-400/80 font-sans',
    accentClass: 'text-amber-400',
    fontFamily: 'font-serif',
    styleType: 'gold'
  },
  {
    id: 'festive-joy',
    name: 'Festive Joy',
    nameAr: 'ألعاب نارية وبهجة',
    bgClass: 'bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950/50',
    cardBgClass: 'bg-slate-900/90 border border-indigo-500/30 shadow-indigo-500/10',
    borderClass: 'border-2 border-indigo-400',
    textPrimaryClass: 'text-indigo-100 font-sans',
    textSecondaryClass: 'text-purple-300 font-sans',
    accentClass: 'text-pink-400',
    fontFamily: 'font-sans',
    styleType: 'festive'
  },
  {
    id: 'sudanese-heritage',
    name: 'Sudanese Heritage',
    nameAr: 'النجاح السوداني الأصيل',
    bgClass: 'bg-gradient-to-br from-emerald-950 via-blue-950 to-slate-900',
    cardBgClass: 'bg-slate-900/90 border border-emerald-500/30 shadow-emerald-500/10',
    borderClass: 'border-2 border-emerald-400',
    textPrimaryClass: 'text-emerald-50 font-kufi',
    textSecondaryClass: 'text-blue-300 font-sans',
    accentClass: 'text-yellow-400',
    fontFamily: 'font-kufi',
    styleType: 'heritage'
  },
  {
    id: 'classic-academic',
    name: 'Classic Academic',
    nameAr: 'الأكاديمي الكلاسيكي',
    bgClass: 'bg-gradient-to-br from-amber-50/80 to-stone-100',
    cardBgClass: 'bg-stone-50 border border-stone-300 shadow-xl shadow-stone-200',
    borderClass: 'border-4 border-double border-amber-800',
    textPrimaryClass: 'text-stone-800 font-serif',
    textSecondaryClass: 'text-amber-900/70 font-serif',
    accentClass: 'text-amber-800',
    fontFamily: 'font-serif',
    styleType: 'academic'
  },
  {
    id: 'modern-gradient',
    name: 'Modern Minimal',
    nameAr: 'العصري الأنيق',
    bgClass: 'bg-gradient-to-br from-cyan-950 via-slate-900 to-teal-950/40',
    cardBgClass: 'bg-slate-900/90 border border-cyan-500/30 shadow-cyan-500/10',
    borderClass: 'border-2 border-cyan-400',
    textPrimaryClass: 'text-cyan-50 font-sans',
    textSecondaryClass: 'text-teal-300 font-sans',
    accentClass: 'text-cyan-400',
    fontFamily: 'font-sans',
    styleType: 'modern'
  }
];

interface CardRendererProps {
  config: CardConfig;
  className?: string;
  isPrinting?: boolean;
}

export const CardRenderer: React.FC<CardRendererProps> = ({ config, className = '', isPrinting = false }) => {
  const template = CARD_TEMPLATES.find((t) => t.id === config.templateId) || CARD_TEMPLATES[0];

  const renderOrnament = () => {
    switch (template.styleType) {
      case 'gold':
        return (
          <>
            <div className="absolute top-4 left-4 text-amber-500 opacity-60"><Star className="w-6 h-6 animate-pulse" /></div>
            <div className="absolute top-4 right-4 text-amber-500 opacity-60"><Star className="w-6 h-6 animate-pulse" /></div>
            <div className="absolute bottom-4 left-4 text-amber-500 opacity-60"><Award className="w-6 h-6" /></div>
            <div className="absolute bottom-4 right-4 text-amber-500 opacity-60"><GraduationCap className="w-6 h-6" /></div>
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent"></div>
          </>
        );
      case 'festive':
        return (
          <>
            <div className="absolute top-4 left-4 text-pink-400 opacity-70 animate-bounce"><Sparkles className="w-6 h-6" /></div>
            <div className="absolute top-4 right-4 text-indigo-400 opacity-70 animate-bounce delay-100"><Sparkles className="w-6 h-6" /></div>
            <div className="absolute bottom-4 left-4 text-purple-400 opacity-60"><Heart className="w-6 h-6" /></div>
            <div className="absolute bottom-4 right-4 text-pink-400 opacity-60"><Star className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} /></div>
            {/* Animated background confetti circles */}
            <div className="absolute top-1/4 left-10 w-2 h-2 rounded-full bg-pink-500 animate-ping"></div>
            <div className="absolute bottom-1/4 right-10 w-3 h-3 rounded-full bg-yellow-400 animate-ping delay-300"></div>
          </>
        );
      case 'heritage':
        return (
          <>
            <div className="absolute top-4 left-4 text-emerald-400 opacity-70"><Landmark className="w-6 h-6" /></div>
            <div className="absolute top-4 right-4 text-emerald-400 opacity-70"><Award className="w-6 h-6" /></div>
            {/* Traditional islamic geometric accent lines in borders */}
            <div className="absolute inset-2 border border-yellow-500/20 pointer-events-none rounded-lg"></div>
            <div className="absolute bottom-4 left-4 text-yellow-500 opacity-60"><Star className="w-6 h-6" /></div>
            <div className="absolute bottom-4 right-4 text-emerald-400 opacity-60"><GraduationCap className="w-6 h-6" /></div>
          </>
        );
      case 'academic':
        return (
          <>
            <div className="absolute top-6 left-6 text-amber-800 opacity-50"><GraduationCap className="w-8 h-8" /></div>
            <div className="absolute top-6 right-6 text-amber-800 opacity-50"><Award className="w-8 h-8" /></div>
            <div className="absolute inset-3 border border-amber-800/10 pointer-events-none"></div>
            <div className="absolute bottom-6 left-6 text-amber-800 opacity-50"><Star className="w-6 h-6" /></div>
            <div className="absolute bottom-6 right-6 text-stone-600 opacity-50 font-cinzel text-xs font-semibold">GRADUATE</div>
          </>
        );
      case 'modern':
      default:
        return (
          <>
            <div className="absolute top-4 left-4 text-cyan-400 opacity-70 animate-pulse"><Sparkles className="w-6 h-6" /></div>
            <div className="absolute top-4 right-4 text-cyan-400 opacity-70 animate-pulse"><Star className="w-6 h-6" /></div>
            <div className="absolute inset-4 border border-cyan-500/10 pointer-events-none rounded"></div>
            <div className="absolute bottom-4 left-4 text-teal-400 opacity-60"><Award className="w-6 h-6" /></div>
            <div className="absolute bottom-4 right-4 text-cyan-400 opacity-60"><GraduationCap className="w-6 h-6" /></div>
          </>
        );
    }
  };

  const isDark = template.styleType !== 'academic';

  return (
    <div 
      dir="rtl"
      className={`relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all duration-300 ${template.bgClass} ${template.fontFamily} ${className} ${
        isPrinting ? 'w-[800px] h-[550px] flex flex-col justify-between' : 'aspect-[1.5/1] w-full min-h-[380px] md:min-h-[460px] flex flex-col justify-between shadow-2xl'
      }`}
      style={{ contentVisibility: 'auto' }}
    >
      {/* Background radial soft light */}
      <div className={`absolute inset-0 pointer-events-none ${
        template.styleType === 'gold' ? 'gold-radial-gradient' :
        template.styleType === 'festive' ? 'festive-radial-gradient' :
        template.styleType === 'heritage' ? 'heritage-radial-gradient' : ''
      }`} />

      {/* Decorative inner border card container */}
      <div className={`relative flex-1 flex flex-col justify-between rounded-xl p-6 md:p-8 ${template.cardBgClass} ${template.borderClass}`}>
        {renderOrnament()}

        {/* Header containing Grade & School / State details */}
        <div className="flex justify-between items-start border-b border-dashed border-current pb-3 opacity-90 text-xs md:text-sm">
          <div className="flex flex-col text-right">
            <span className={`${template.textSecondaryClass} font-semibold flex items-center gap-1.5`}>
              <GraduationCap className="w-4 h-4 text-current" />
              {config.grade || 'التعليم المتوسط'}
            </span>
            {config.school && (
              <span className="text-[10px] md:text-xs opacity-75 mt-0.5">
                مدرسة: {config.school}
              </span>
            )}
          </div>

          <div className="flex flex-col text-left">
            {config.state && (
              <span className={`${template.textSecondaryClass} font-semibold`}>
                ولاية: {config.state}
              </span>
            )}
            {config.seatNumber && (
              <span className="text-[10px] md:text-xs opacity-75 mt-0.5">
                رقم الجلوس: {config.seatNumber}
              </span>
            )}
          </div>
        </div>

        {/* Card Body - Name, Score, Status, Main congratulation text */}
        <div className="my-auto py-4 text-center flex flex-col justify-center items-center gap-2 md:gap-3">
          <div className="text-xs md:text-sm tracking-wider uppercase opacity-80 mb-1">
            {config.gender === 'female' ? 'نهنئ ونبارك للطالبة المتميزة' : 'نهنئ ونبارك للطالب المتميز'}
          </div>

          {/* Student Name */}
          <h1 className={`text-2xl md:text-4xl font-black tracking-tight ${template.textPrimaryClass} ${
            template.styleType === 'gold' ? 'glow-text' : ''
          }`}>
            {config.studentName || 'نور الايمان لؤي عبدالله'}
          </h1>

          {/* Score & Status Panel */}
          {config.score && (
            <div className="flex items-center gap-3 mt-1 justify-center">
              <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                isDark ? 'bg-white/10 text-white' : 'bg-stone-200 text-stone-800'
              }`}>
                <Award className="w-3.5 h-3.5 text-yellow-500" />
                المجموع: {config.score} {config.maxScore ? `/ ${config.maxScore}` : ''}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500 text-white flex items-center gap-1">
                <Check className="w-3.5 h-3.5" />
                الحالة: ناجح
              </span>
            </div>
          )}

          {/* Customized message block */}
          <div className="mt-3 md:mt-4 max-w-lg mx-auto">
            <p className={`text-xs md:text-sm leading-relaxed whitespace-pre-wrap max-h-[120px] overflow-y-auto px-2 ${
              isDark ? 'text-neutral-300' : 'text-stone-600'
            }`}>
              {config.customMessage || 'ألف مبروك النجاح الباهر والتفوق المستحق وعقبال المراتب العليا دوماً! تعبتم وسهرتم فنلتم ما تمنيتم.'}
            </p>
          </div>
        </div>

        {/* Card Footer - Sender Name & Signature */}
        <div className="flex justify-between items-end border-t border-dashed border-current pt-3 opacity-90 text-[10px] md:text-xs">
          <div>
            <span className="opacity-75">مقدم التهنئة:</span>{' '}
            <span className={`font-bold ${template.accentClass}`}>
              {config.senderName || 'محبكم'}
            </span>
          </div>

          <div className="font-cinzel tracking-wider text-[8px] md:text-[10px] opacity-65">
            منصة تهنئة بالنجاح الباهر
          </div>
        </div>
      </div>
    </div>
  );
};
