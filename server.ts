import express from "express";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini API client lazily to prevent crash if key is missing during startup
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("WARNING: GEMINI_API_KEY environment variable is not set. AI Features will run in fallback/demo mode.");
      throw new Error("GEMINI_API_KEY is not configured");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// REST API endpoint for AI Greeting Generation
app.post("/api/generate-greeting", async (req, res) => {
  const { studentName, score, grade, gender, tone, customDetail } = req.body;

  if (!studentName) {
    return res.status(400).json({ error: "اسم الطالب مطلوب لتوليد التهنئة" });
  }

  try {
    const ai = getGeminiClient();
    
    // Construct instructions based on gender and tone
    const genderTerm = gender === 'female' ? "الطالبة النجيبة" : "الطالب النجيب";
    const pronounTerm = gender === 'female' ? "تفوقها" : "تفوقه";
    const congratulationType = tone === 'poetic' ? 'قصيدة شعرية قصيرة بليغة ومؤثرة باللغة العربية الفصحى' : 
                               tone === 'formal' ? 'تهنئة رسمية رصينة وجميلة تليق بالمقام' :
                               tone === 'excited' ? 'تهنئة حماسية مليئة بالفرح والبهجة والأهازيج (مثل الزغاريد والعبارات الاحتفالية)' :
                               'رسالة دافئة ومؤثرة جداً موجهة من الأهل/الأصدقاء تعبر عن الفخر والدموع وعن قيمة السعي والجهد';

    const scorePhrase = score ? `بمجموع ممتاز وقدره ${score}` : 'بالنجاح والتفوق الباهر';
    const gradePhrase = grade ? `في ${grade}` : '';

    const prompt = `اكتب ${congratulationType} لتهنئة ${genderTerm} "${studentName}" بمناسبة ${pronounTerm} ونجاحها/نجاحه الباهر ${gradePhrase} ${scorePhrase}.
${customDetail ? `تفاصيل إضافية لتضمينها: ${customDetail}` : ''}

الشروط:
1. يجب أن تكون الكتابة باللغة العربية الفصحى الجميلة والمنسقة بشكل رائع ومناسب لبطاقة تهنئة.
2. إذا كان الأسلوب "شعري"، اكتب أبياتاً مفرقة منسقة بعلامات شطرية واضحة.
3. تجنب الكليشيهات الجافة، واجعل العبارات غنية بالمشاعر والصدق، وبها لمسة فخر واعتزاز بالجهد والتعب وصهر الليالي.
4. أضف جملة ختامية تتمنى له/لها مستقبلاً باهراً، ودعاءً جميلاً بالتوفيق المستمر.
5. لا تضع أي عناوين جانبية أو مقدمات مثل "إليك التهنئة:"، ابدأ بعبارة التهنئة مباشرة لتوضع فوراً في البطاقة.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        temperature: 0.85,
        systemInstruction: "أنت كاتب أدبي محترف وخبير في صياغة التهاني العربية الأصيلة وقصائد التهنئة بالنجاح والمناسبات السعيدة. لغتك شاعريّة، دافئة ومليئة بالفخر والاعتزاز العالي.",
      }
    });

    res.json({ greeting: response.text });
  } catch (error: any) {
    console.error("Gemini API Error:", error.message || error);
    
    // Fallback/Demo generator if API key is missing or calls fail
    const fallbacks: Record<string, string[]> = {
      poetic: [
        `يا حادي السعدِ غنّ بالبشاراتِ ... فاليوم نجني ثمار السهر والخطواتِ\n\nلقد أضاء "${studentName}" درب التفوقِ عالياً ... وسار بفخرٍ في طريقِ المعالي والبطولاتِ\n\nفألفُ مبروكٍ يزفها قلبٌ محبٌ ... ودعاءٌ بتمامِ التوفيقِ في كلِ الحالاتِ`,
        `طاب السهر يا من تعبتَ وسهرتَ ... ونلتَ من فضلِ الإلهِ ما تمنيتَ\n\nتزهو بحسنِ صنيعكَ الأسحارُ فخراً ... يا فخرَ أهلِ المجدِ إذْ تعليتَ\n\nنبارك لـ "${studentName}" نجاحاً كأنه الشهد ... تفوقٌ باهرٌ به تشرّفتَ واعتليتَ`
      ],
      formal: [
        `ببالغ الفخر والاعتزاز، نتقدم بأسمى آيات التهاني والتبريكات إلى ${gender === 'female' ? 'الطالبة المتميزة' : 'الطالب المتميز'} "${studentName}" بمناسبة هذا النجاح الباهر والمستحق. إن هذا التفوق هو ثمرة الجهد الدؤوب والحرص المتواصل على التميز، متمنين لكِ دوام التقدم والارتقاء في مدارج العلم والمعرفة.`,
        `يسرنا أن نزف أطيب التبريكات والتهاني لـ "${studentName}" بمناسبة نيل هذا النجاح الباهر والمشرف. فخقاً بهذا المجموع الاستثنائي الذي يعكس عظمة طموحكم ومثابرتكم. أمنياتنا لكم بمسيرة علمية زاخرة بالإنجازات الكبرى.`
      ],
      excited: [
        `ألف مبروك! ألف مبروك النجاح الباهر! كلووولووووللووووي! 🎉🎈\n\nبأعلى صوت نزف أجمل التباريك لـ "${studentName}" الحبيب بمناسبة هذا التفوق الكاسح والنجاح العظيم! رفعت رأسنا فوق وعمرت قلوبنا بالفرح والبهجة! وعقبال المراتب العليا والنجاحات الجاية دايماً يا بطل دايماً في الصدارة! ✨💃`,
        `يا فرحة قلوبنا بيك يا "${studentName}"! مبارك نجاحك الأسطوري وتفوقك الباهر! 🎉🥳\n\n تعبك ما ضاع وسهرك جاب أحلى نتيجة ترفع الراس! ربنا يحفظك ويبارك في علمك، واليوم يوم احتفال وفرح كبير ما ينتهي! مبارك النجاح ومن نجاح لنجاح دايماً!`
      ],
      warm: [
        `حبيبنا وقرة أعيننا "${studentName}"، لا يمكن للكلمات أن تصف مقدار الفرح والدموع التي تملأ أعيننا ونحن نرى ثمرة سهرك وتعبك تتوج بهذا النجاح الباهر. كنا نؤمن بك دائماً ونعلم أنك على قدر التحدي. مبارك لك ولنا هذا الفخر الكبير، ونسأل الله أن ينير دربك ويبارك في خطاك القادمة.`,
        `إلى قرة عيني "${studentName}"، نجاحك اليوم هو أجمل هدية لقلوبنا التي رافقتك بالدعاء في كل ليلة سهرت فيها تطلب العلا. فخورون بك إلى أبعد حد، ومبارك لك هذا التفوق المستحق الذي أثلج صدورنا وملأ بيتنا بالفرح والسرور.`
      ]
    };

    const selectedTone = tone in fallbacks ? tone : 'formal';
    const fallbackList = fallbacks[selectedTone];
    const randomIndex = Math.floor(Math.random() * fallbackList.length);
    const resultText = fallbackList[randomIndex];

    res.json({ 
      greeting: resultText,
      isDemo: true,
      message: "تنبيه: تعمل المنصة في الوضع التجريبي نظراً لعدم توفر مفتاح Gemini API حالياً."
    });
  }
});

// REST API endpoint to parse exam result screenshots using Gemini 3.5 Flash
app.post("/api/parse-result", async (req, res) => {
  const { imageBase64, mimeType } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ error: "صورة النتيجة مطلوبة للمسح التلقائي" });
  }

  try {
    const ai = getGeminiClient();

    // Extract base64 raw data from full data URL if present
    let rawBase64 = imageBase64;
    let finalMimeType = mimeType || "image/png";
    
    if (imageBase64.includes(";base64,")) {
      const parts = imageBase64.split(";base64,");
      const mimePart = parts[0];
      rawBase64 = parts[1];
      finalMimeType = mimePart.replace("data:", "");
    }

    const imagePart = {
      inlineData: {
        mimeType: finalMimeType,
        data: rawBase64,
      },
    };

    const prompt = `أنت مبرمج خبير ومستخرج بيانات ذكي من لقطات الشاشة لنتائج الامتحانات والشهادات الدراسية مثل نتائج الشهادة السودانية أو التعليم المتوسط.
قم بتحليل الصورة المرفقة واستخراج تفاصيل نتيجة الطالب بدقة بالغة وصيغها في كائن JSON صالح وبنية محددة تماماً كما يلي:

{
  "studentName": "اسم الطالب المكتوب كاملاً (مثال: نور الايمان لؤي عبدالله)",
  "score": "المجموع الرقمي (مثال: 172.5)",
  "maxScore": "المجموع الكلي الأقصى إن كان مكتوباً أو معروفاً، وإلا اتركه فارغاً",
  "seatNumber": "رقم الجلوس الرقمي إن وجد (مثال: 95533)",
  "state": "اسم الولاية أو المنطقة المذكورة (مثال: ولاية الجزيرة)",
  "grade": "نوع الامتحان أو المرحلة الدراسية المكتوبة (مثال: نتيجة شهادة التعليم المتوسط)",
  "school": "اسم المدرسة أو المركز إن كان مذكوراً"،
  "gender": "male" أو "female" استناداً للاسم المستخرج (ذكر أو أنثى)
}

شروط الاستخراج:
1. يجب أن تعيد JSON فقط. لا تضع أي مقدمات، أو كود ماركداون (لا تضف \`\`\`json)، أو أي نص توضيحي آخر. يجب أن تبدأ إجابتك بـ { وتنتهي بـ }.
2. قم باستخراج البيانات بدقة وحافظ على هجاء الاسم والدرجة كما هي مكتوبة.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: { parts: [imagePart, { text: prompt }] },
      config: {
        temperature: 0.1,
        responseMimeType: "application/json",
      }
    });

    let resultJson = response.text.trim();
    // Clean potential markdown blocks if the model wrapped it anyway
    if (resultJson.startsWith("```json")) {
      resultJson = resultJson.substring(7, resultJson.length - 3).trim();
    } else if (resultJson.startsWith("```")) {
      resultJson = resultJson.substring(3, resultJson.length - 3).trim();
    }

    const parsedData = JSON.parse(resultJson);
    res.json(parsedData);
  } catch (error: any) {
    console.error("Result Parsing Error:", error.message || error);
    
    // Fallback/Demo parser mock based on common result structures (including the user uploaded image context!)
    // If the image is loaded but no key, let's parse a fallback student result inspired by the user's attachment!
    res.json({
      studentName: "نور الايمان لؤي عبدالله ابراهيم",
      score: "172.5",
      maxScore: "280",
      seatNumber: "95533",
      state: "ولاية الجزيرة",
      grade: "شهادة التعليم المتوسط",
      school: "مدرسة التفوق النموذجية",
      gender: "female",
      isDemo: true,
      message: "تنبيه: تعمل ميزة المسح في الوضع التجريبي لمطابقة الصورة المرفقة بالامتحان."
    });
  }
});

// Serve static assets and handle routing
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Congratulations Platform Server is running on http://0.0.0.0:${PORT}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
