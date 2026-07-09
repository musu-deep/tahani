export interface StudentDetails {
  name: string;
  score: string;
  maxScore?: string;
  seatNumber?: string;
  state?: string;
  school?: string;
  grade?: string; // e.g. "المرحلة المتوسطة" or "الشهادة الثانوية"
}

export interface CardConfig {
  studentName: string;
  score: string;
  maxScore: string;
  seatNumber: string;
  state: string;
  school: string;
  grade: string;
  senderName: string;
  customMessage: string;
  templateId: string;
  gender: 'male' | 'female';
}

export interface CardTemplate {
  id: string;
  name: string;
  nameAr: string;
  bgClass: string;
  cardBgClass: string;
  borderClass: string;
  textPrimaryClass: string;
  textSecondaryClass: string;
  accentClass: string;
  fontFamily: string;
  styleType: 'gold' | 'festive' | 'heritage' | 'academic' | 'modern';
}

export interface CelebrationPost {
  id: string;
  studentName: string;
  score: string;
  grade?: string;
  senderName: string;
  message: string;
  templateId: string;
  likes: number;
  commentsCount: number;
  isLiked?: boolean;
  createdAt: string;
}
