import React, { useState, useRef } from 'react';
import { CardConfig, CardTemplate } from '../types';
import { CardRenderer, CARD_TEMPLATES } from './CardTemplates';
import { Sparkles, ArrowRight, Upload, HelpCircle, Download, FileText, Share2, Check, RefreshCw, Volume2, User, Award, Hash, GraduationCap, MapPin, Map, CheckSquare } from 'lucide-react';
import { sound } from '../utils/audio';

interface CardGeneratorProps {
  initialConfig?: Partial<CardConfig>;
  onSaveCard: (config: CardConfig) => void;
  onBackToWall: () => void;
  triggerFireworks: () => void;
}

export const CardGenerator: React.FC<CardGeneratorProps> = ({
  initialConfig,
  onSaveCard,
  onBackToWall,
  triggerFireworks
}) => {
  // Form State
  const [config, setConfig] = useState<CardConfig>({
    studentName: initialConfig?.studentName || '',
    score: initialConfig?.score || '',
    maxScore: initialConfig?.maxScore || '280',
    seatNumber: initialConfig?.seatNumber || '',
    state: initialConfig?.state || 'ولاية الجزيرة',
    school: initialConfig?.school || '',
    grade: initialConfig?.grade || 'شهادة التعليم المتوسط',
    senderName: initialConfig?.senderName || '',
    customMessage: initialConfig?.customMessage || '',
    templateId: initialConfig?.templateId || 'royal-gold',
    gender: initialConfig?.gender || 'female', // default to match user's screenshot student "نور الايمان"
  });

  // UI State
  const [isScanning, setIsScanning] = useState(false);
  const [isGeneratingGreeting, setIsGeneratingGreeting] = useState(false);
  const [selectedTone, setSelectedTone] = useState<'poetic' | 'formal' | 'excited' | 'warm'>('excited');
  const [ocrSuccess, setOcrSuccess] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenderSelect = (gender: 'male' | 'female') => {
    setConfig((prev) => ({ ...prev, gender }));
  };

  const handleTemplateSelect = (templateId: string) => {
    setConfig((prev) => ({ ...prev, templateId }));
    sound.playPop();
  };

  // OCR Screenshot scan handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    await scanResultImage(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      await scanResultImage(file);
    }
  };

  const scanResultImage = async (file: File) => {
    setIsScanning(true);
    setOcrSuccess(null);
    setErrorMessage(null);
    sound.playPop();

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      try {
        const response = await fetch('/api/parse-result', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String, mimeType: file.type }),
        });

        if (!response.ok) {
          throw new Error('فشل معالجة لقطة الشاشة من السيرفر');
        }

        const data = await response.json();
        
        // Auto-populate form
        setConfig((prev) => ({
          ...prev,
          studentName: data.studentName || prev.studentName,
          score: data.score || prev.score,
          maxScore: data.maxScore || prev.maxScore,
          seatNumber: data.seatNumber || prev.seatNumber,
          state: data.state || prev.state,
          school: data.school || prev.school,
          grade: data.grade || prev.grade,
          gender: data.gender || prev.gender,
        }));

        setOcrSuccess('تم مسح لقطة الشاشة واستخراج بيانات التفوق بنجاح!');
        sound.playFanfare();
        triggerFireworks();
      } catch (err: any) {
        console.error(err);
        setErrorMessage('تعذر قراءة بيانات النتيجة بالذكاء الاصطناعي. الرجاء تعبئة الحقول يدوياً.');
      } finally {
        setIsScanning(false);
      }
    };
    reader.onerror = () => {
      setErrorMessage('خطأ أثناء قراءة ملف الصورة.');
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  // AI custom greeting generator using server endpoint (Gemini Flash)
  const generateAIGreeting = async () => {
    if (!config.studentName) {
      setErrorMessage('يرجى إدخال اسم الطالب أولاً ليتمكن الذكاء الاصطناعي من صياغة تهنئة مخصصة له.');
      return;
    }

    setIsGeneratingGreeting(true);
    setErrorMessage(null);
    sound.playPop();

    try {
      const response = await fetch('/api/generate-greeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentName: config.studentName,
          score: config.score,
          grade: config.grade,
          gender: config.gender,
          tone: selectedTone,
        }),
      });

      if (!response.ok) {
        throw new Error('فشل توليد التهنئة من السيرفر');
      }

      const data = await response.json();
      setConfig((prev) => ({ ...prev, customMessage: data.greeting }));
      sound.playFanfare();
    } catch (err: any) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء توليد التهنئة بالذكاء الاصطناعي.');
    } finally {
      setIsGeneratingGreeting(false);
    }
  };

  // Trigger browser print of the isolated card
  const handlePrintCard = () => {
    sound.playPop();
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('يرجى السماح بالنوافذ المنبثقة لطباعة البطاقة');
      return;
    }

    const template = CARD_TEMPLATES.find((t) => t.id === config.templateId) || CARD_TEMPLATES[0];
    
    // Inject custom print styles and render cards inside printable body
    printWindow.document.write(`
      <html>
        <head>
          <title>بطاقة تهنئة - ${config.studentName}</title>
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Amiri:wght@400;700&family=Tajawal:wght@400;700;900&family=Reem+Kufi:wght@400;700&display=swap">
          <script src="https://cdn.tailwindcss.com"></script>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;700;900&family=Amiri:wght@400;700&family=Tajawal:wght@400;700;900&family=Reem+Kufi:wght@400;700&display=swap');
            body {
              margin: 0;
              padding: 0;
              background-color: white;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              direction: rtl;
            }
            .arabic-card-to-print {
              width: 210mm;
              height: 148mm;
              box-sizing: border-box;
              page-break-inside: avoid;
            }
            @media print {
              body {
                background: none;
              }
              @page {
                size: A5 landscape;
                margin: 0;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="arabic-card-to-print p-6 md:p-8 rounded-2xl flex flex-col justify-between ${template.bgClass} ${template.fontFamily}">
            <div class="relative flex-1 flex flex-col justify-between rounded-xl p-8 ${template.cardBgClass} ${template.borderClass}">
              
              <!-- Header -->
              <div class="flex justify-between items-start border-b border-dashed border-current pb-4 opacity-90 text-sm">
                <div class="flex flex-col text-right">
                  <span class="${template.textSecondaryClass} font-bold">
                    ${config.grade || 'التعليم المتوسط'}
                  </span>
                  ${config.school ? `<span class="text-xs opacity-75 mt-1">مدرسة: ${config.school}</span>` : ''}
                </div>
                <div class="flex flex-col text-left">
                  ${config.state ? `<span class="${template.textSecondaryClass} font-bold">ولاية: ${config.state}</span>` : ''}
                  ${config.seatNumber ? `<span class="text-xs opacity-75 mt-1">رقم الجلوس: ${config.seatNumber}</span>` : ''}
                </div>
              </div>

              <!-- Body -->
              <div class="my-auto py-4 text-center flex flex-col justify-center items-center gap-3">
                <div class="text-sm tracking-wider uppercase opacity-80 mb-1">
                  ${config.gender === 'female' ? 'نهنئ ونبارك للطالبة المتميزة' : 'نهنئ ونبارك للطالب المتميز'}
                </div>
                <h1 class="text-4xl font-black tracking-tight ${template.textPrimaryClass}">
                  ${config.studentName}
                </h1>
                ${config.score ? `
                  <div class="flex items-center gap-4 mt-2 justify-center">
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-black/20 ${template.textPrimaryClass}">
                      المجموع: ${config.score} ${config.maxScore ? `/ ${config.maxScore}` : ''}
                    </span>
                    <span class="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white">
                      الحالة: ناجح
                    </span>
                  </div>
                ` : ''}
                <div class="mt-4 max-w-lg mx-auto">
                  <p class="text-sm leading-relaxed whitespace-pre-wrap ${template.textPrimaryClass} opacity-90">
                    ${config.customMessage || 'ألف مبروك النجاح والتفوق الباهر!'}
                  </p>
                </div>
              </div>

              <!-- Footer -->
              <div class="flex justify-between items-end border-t border-dashed border-current pt-4 opacity-90 text-xs">
                <div>
                  <span class="opacity-75">مقدم التهنئة:</span> 
                  <span class="font-bold ${template.accentClass}">${config.senderName || 'محبكم'}</span>
                </div>
                <div class="font-semibold opacity-70">
                  منصة تهنئة بالنجاح الباهر
                </div>
              </div>

            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              // Close window after printing
              setTimeout(() => { window.close(); }, 500);
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config.studentName) {
      setErrorMessage('يرجى إدخال اسم الطالب لحفظ بطاقة التهنئة.');
      return;
    }

    onSaveCard(config);
    setSaveSuccess(true);
    sound.playFanfare();
    triggerFireworks();

    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8" dir="rtl">
      
      {/* Configuration Form on Right */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        
        {/* Form Container */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-neutral-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-neutral-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              صمم بطاقة التهنئة المخصصة
            </h2>
            <button
              onClick={onBackToWall}
              className="text-xs text-neutral-500 hover:text-amber-600 font-bold flex items-center gap-1 transition-colors"
            >
              الرجوع لجدار الاحتفالات
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Screenshot Upload parser (Very smart UX!) */}
          <div 
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-amber-300 rounded-xl p-5 mb-6 text-center cursor-pointer bg-amber-50/20 hover:bg-amber-50/50 transition-all group relative overflow-hidden"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              className="hidden" 
            />
            
            {isScanning ? (
              <div className="flex flex-col items-center py-4">
                <RefreshCw className="w-8 h-8 text-amber-500 animate-spin mb-3" />
                <span className="text-sm font-bold text-amber-800">جاري قراءة وتحليل بيانات النتيجة بالذكاء الاصطناعي...</span>
                <span className="text-xs text-neutral-400 mt-1">يتم استخراج الاسم والمجموع والولاية ورقم الجلوس تلقائياً</span>
                {/* Horizontal scanning laser effect */}
                <div className="absolute inset-x-0 h-1 bg-amber-400 shadow-md shadow-amber-400/80 top-0 animate-[bounce_2s_infinite] pointer-events-none"></div>
              </div>
            ) : (
              <div className="flex flex-col items-center py-2">
                <Upload className="w-8 h-8 text-amber-500 group-hover:scale-110 transition-transform mb-3" />
                <span className="text-sm font-bold text-neutral-700">اسحب وأفلت لقطة شاشة النتيجة هنا أو انقر للاستيراد</span>
                <span className="text-xs text-neutral-400 mt-1">
                  (مثالي لنتائج الشهادة السودانية، المتوسطة، أو أي جدول نتيجة لتعبئة الاستمارة تلقائياً)
                </span>
              </div>
            )}
          </div>

          {/* OCR Feedback */}
          {ocrSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-3.5 mb-6 text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{ocrSuccess}</span>
            </div>
          )}

          {/* Form Fields */}
          <form onSubmit={handleSaveSubmit} className="space-y-4">
            
            {/* Student Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-neutral-400" />
                اسم الطالب / الطالبة كامل ثنائياً أو ثلاثياً *
              </label>
              <input
                type="text"
                name="studentName"
                required
                value={config.studentName}
                onChange={handleInputChange}
                placeholder="مثال: نور الايمان لؤي عبدالله"
                className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans"
              />
            </div>

            {/* Gender Switch */}
            <div>
              <span className="block text-xs font-bold text-neutral-700 mb-1.5">صيغة الخطاب</span>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleGenderSelect('female')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    config.gender === 'female'
                      ? 'bg-pink-500 text-white border-pink-500 shadow-md shadow-pink-500/10'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  طالبة (مؤنث 🌸)
                </button>
                <button
                  type="button"
                  onClick={() => handleGenderSelect('male')}
                  className={`flex-1 py-2 text-xs font-bold rounded-xl border transition-all ${
                    config.gender === 'male'
                      ? 'bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/10'
                      : 'bg-neutral-50 text-neutral-600 border-neutral-200 hover:bg-neutral-100'
                  }`}
                >
                  طالب (مذكر 👔)
                </button>
              </div>
            </div>

            {/* Score & MaxScore */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-neutral-400" />
                  المجموع الحاصل عليه
                </label>
                <input
                  type="text"
                  name="score"
                  value={config.score}
                  onChange={handleInputChange}
                  placeholder="مثال: 172.5"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-neutral-400" />
                  المجموع الكلي الأقصى
                </label>
                <input
                  type="text"
                  name="maxScore"
                  value={config.maxScore}
                  onChange={handleInputChange}
                  placeholder="مثال: 280"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans"
                />
              </div>
            </div>

            {/* Seat Number & School */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-neutral-400" />
                  رقم الجلوس (اختياري)
                </label>
                <input
                  type="text"
                  name="seatNumber"
                  value={config.seatNumber}
                  onChange={handleInputChange}
                  placeholder="مثال: 95533"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-neutral-400" />
                  المدرسة / المركز
                </label>
                <input
                  type="text"
                  name="school"
                  value={config.school}
                  onChange={handleInputChange}
                  placeholder="مثال: النموذجية بنين"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans"
                />
              </div>
            </div>

            {/* Grade Level & State */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-neutral-400" />
                  المرحلة الدراسية
                </label>
                <select
                  name="grade"
                  value={config.grade}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans bg-white"
                >
                  <option value="شهادة التعليم المتوسط">شهادة التعليم المتوسط 🎓</option>
                  <option value="الشهادة الثانوية السودانية">الشهادة الثانوية 🌟</option>
                  <option value="شهادة التعليم الابتدائي">المرحلة الابتدائية 🎒</option>
                  <option value="المرحلة الجامعية">المرحلة الجامعية 🏛️</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  الولاية / المنطقة
                </label>
                <input
                  type="text"
                  name="state"
                  value={config.state}
                  onChange={handleInputChange}
                  placeholder="مثال: ولاية الجزيرة"
                  className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans"
                />
              </div>
            </div>

            {/* Sender Name */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">اسم مقدم التهنئة (المرسل) *</label>
              <input
                type="text"
                name="senderName"
                required
                value={config.senderName}
                onChange={handleInputChange}
                placeholder="مثال: والدك المحب / عائلة عبدالله"
                className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans"
              />
            </div>

            {/* AI Generator Box */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 rounded-xl p-4 mt-6">
              <span className="block text-xs font-bold text-amber-800 mb-2 flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
                صياغة تهنئة شعرية أو بليغة بالذكاء الاصطناعي (Gemini AI)
              </span>
              
              <div className="flex flex-wrap gap-2 mb-3">
                {[
                  { id: 'excited', label: 'حماسية مبهجة 🎉' },
                  { id: 'poetic', label: 'أبيات شعرية فصيحة 📜' },
                  { id: 'formal', label: 'رسمية رصينة 🏛️' },
                  { id: 'warm', label: 'عاطفية دافئة ❤️' },
                ].map((tone) => (
                  <button
                    key={tone.id}
                    type="button"
                    onClick={() => setSelectedTone(tone.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      selectedTone === tone.id
                        ? 'bg-amber-500 text-white'
                        : 'bg-white hover:bg-neutral-100 text-neutral-600 border border-neutral-200/60'
                    }`}
                  >
                    {tone.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={generateAIGreeting}
                disabled={isGeneratingGreeting}
                className="w-full bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-400 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isGeneratingGreeting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    جاري صياغة الكلمات الذهبية...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    اكتب نص التهنئة بالذكاء الاصطناعي ✨
                  </>
                )}
              </button>
            </div>

            {/* Custom Message Field */}
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">نص رسالة التهنئة المباركة</label>
              <textarea
                name="customMessage"
                rows={3}
                value={config.customMessage}
                onChange={handleInputChange}
                placeholder="مثال: ألف مبروك هذا التميز الإبداعي وعقبال المراتب العليا دوماً!"
                className="w-full px-4 py-2 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-neutral-800 font-sans leading-relaxed"
              />
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs font-semibold p-3 rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* Form Actions */}
            <div className="pt-2 flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-amber-500/10 cursor-pointer"
              >
                {saveSuccess ? 'تم الحفظ على الجدار! 🎉' : 'احفظ وانشر على الجدار العام'}
              </button>
            </div>

          </form>
        </div>

      </div>

      {/* Live Preview on Left */}
      <div className="w-full lg:w-1/2 flex flex-col gap-6">
        
        {/* Template Selector */}
        <div className="bg-white/85 backdrop-blur-md rounded-2xl p-6 shadow-lg border border-neutral-100">
          <h3 className="text-sm font-bold text-neutral-700 mb-3">اختر قالب البطاقة الفني:</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {CARD_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleTemplateSelect(tpl.id)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all border text-center ${
                  config.templateId === tpl.id
                    ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-md scale-102'
                    : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600 bg-white'
                }`}
              >
                {tpl.nameAr}
              </button>
            ))}
          </div>
        </div>

        {/* Live Card Render Box */}
        <div className="flex flex-col items-center">
          <span className="text-xs font-bold text-neutral-500 self-start mb-2 mr-1">معاينة حية وتفاعلية للبطاقة:</span>
          
          <div className="w-full export-card-wrapper transition-all duration-300">
            <CardRenderer config={config} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3 justify-center w-full">
            <button
              onClick={handlePrintCard}
              className="px-5 py-3 rounded-xl bg-neutral-950 hover:bg-neutral-800 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              تنزيل ملف التهنئة (صيغة PDF / طباعة)
            </button>
            
            <button
              onClick={() => {
                sound.playFanfare();
                triggerFireworks();
              }}
              className="px-5 py-3 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-800 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
              أطلق فرحة ومؤثرات صوتية! 🔊
            </button>
          </div>

          <div className="mt-4 bg-amber-50/50 border border-amber-100 rounded-xl p-4 text-center max-w-sm">
            <p className="text-[11px] text-amber-800 leading-relaxed font-sans">
              💡 **تلميح:** عند النقر على تنزيل PDF، سيفتح المتصفح نافذة الطباعة المنظمة بدقة مقاس A5 لطباعتها أو حفظها كملف PDF رقمي فائق الدقة لمشاركتها فوراً عبر واتساب ومواقع التواصل!
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
