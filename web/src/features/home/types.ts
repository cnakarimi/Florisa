export interface Product {
  id: string;
  title: string;
  titleEnglish?: string;
  category: 'plants' | 'flowers' | 'pots' | 'care';
  categoryLabel: string;
  price: number; // in Toman
  discountPrice?: number;
  image: string;
  potType: string;
  careTags: string[]; // e.g. ["نگهداری آسان", "تصفیه‌کننده هوا"]
  sunlight: 'مستقیم' | 'غیرمستقیم' | 'سایه دوست' | 'کم‌نور';
  watering: 'هفتگی یکبار' | 'هر ۱۰ روز' | 'هنگام خشکی خاک' | 'روزانه';
  humidity: 'متوسط' | 'زیاد' | 'کم';
  isPetFriendly: boolean;
  careLevel: 'آسان' | 'متوسط' | 'حرفه‌ای';
  description: string;
  rating: number;
  reviewCount: number;
  isNew?: boolean;
  isBestseller?: boolean;
}

export interface Category {
  id: string;
  title: string;
  image: string;
  count: number;
}

export interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string[];
  image: string;
  readTime: string;
  date: string;
  author: string;
  tags: string[];
}

export type TabType = 'home' | 'shop' | 'care_ai' | 'favorites' | 'profile';
