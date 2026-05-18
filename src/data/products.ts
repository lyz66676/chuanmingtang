export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  images?: string[];
  description: string;
  specs: { label: string; value: string }[];
  badge?: string;
  sales?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export const categories: Category[] = [
  {
    id: "hotpot",
    name: "火锅底料",
    icon: "🫕",
    description: "正宗四川火锅，麻辣鲜香",
  },
  {
    id: "chili",
    name: "辣椒酱",
    icon: "🌶️",
    description: "秘制辣椒酱，拌饭拌面皆宜",
  },
  {
    id: "snack",
    name: "特色小吃",
    icon: "🥟",
    description: "地道四川味，回味无穷",
  },
  {
    id: "seasoning",
    name: "调味料",
    icon: "🧂",
    description: "川菜灵魂，一勺入魂",
  },
  {
    id: "preserved",
    name: "腊味腌制品",
    icon: "🥩",
    description: "传统工艺，岁月沉淀的味道",
  },
  {
    id: "tea",
    name: "四川茗茶",
    icon: "🍵",
    description: "峨眉山茶，清香悠远",
  },
];

export const products: Product[] = [
  // ---- 火锅底料 ----
  {
    id: "hotpot-001",
    name: "经典麻辣火锅底料（特辣）",
    category: "hotpot",
    subcategory: "火锅底料",
    price: 28.8,
    originalPrice: 35.0,
    rating: 4.8,
    reviewCount: 2341,
    image: "/images/products/hotpot-001.jpg",
    description:
      "精选四川汉源花椒、二荆条辣椒，搭配郫县豆瓣酱，传统工艺熬制6小时以上。麻辣鲜香，层次丰富，是正宗四川火锅的灵魂所在。",
    specs: [
      { label: "净含量", value: "500g" },
      { label: "保质期", value: "18个月" },
      { label: "辣度", value: "🌶️🌶️🌶️🌶️🌶️" },
      { label: "产地", value: "四川成都" },
    ],
    badge: "热销",
    sales: 8562,
  },
  {
    id: "hotpot-002",
    name: "番茄牛油火锅底料",
    category: "hotpot",
    subcategory: "火锅底料",
    price: 22.9,
    originalPrice: 28.0,
    rating: 4.6,
    reviewCount: 1523,
    image: "/images/products/hotpot-002.jpg",
    description:
      "新鲜番茄熬制，搭配醇香牛油，酸甜适口，老少皆宜。不辣但鲜味十足，适合不能吃辣的朋友。",
    specs: [
      { label: "净含量", value: "400g" },
      { label: "保质期", value: "12个月" },
      { label: "辣度", value: "不辣" },
      { label: "产地", value: "四川成都" },
    ],
    sales: 4321,
  },
  {
    id: "hotpot-003",
    name: "青花椒藤椒锅底",
    category: "hotpot",
    subcategory: "火锅底料",
    price: 25.5,
    rating: 4.7,
    reviewCount: 987,
    image: "/images/products/hotpot-003.jpg",
    description:
      "选用四川金阳青花椒，麻香清新，搭配藤椒油的独特清香，带来不一样的火锅体验。",
    specs: [
      { label: "净含量", value: "450g" },
      { label: "保质期", value: "18个月" },
      { label: "辣度", value: "🌶️🌶️" },
      { label: "产地", value: "四川金阳" },
    ],
    badge: "新品",
    sales: 2156,
  },

  // ---- 辣椒酱 ----
  {
    id: "chili-001",
    name: "秘制牛肉辣椒酱",
    category: "chili",
    subcategory: "辣椒酱",
    price: 32.0,
    originalPrice: 38.0,
    rating: 4.9,
    reviewCount: 3210,
    image: "/images/products/chili-001.jpg",
    description:
      "精选上等牛肉粒，搭配二荆条辣椒和四川豆瓣酱，慢火熬制4小时。牛肉粒大颗有嚼劲，辣而不燥，拌饭拌面一绝。",
    specs: [
      { label: "净含量", value: "280g" },
      { label: "保质期", value: "12个月" },
      { label: "辣度", value: "🌶️🌶️🌶️" },
      { label: "产地", value: "四川成都" },
    ],
    badge: "爆款",
    sales: 12580,
  },
  {
    id: "chili-002",
    name: "蒜蓉剁椒酱",
    category: "chili",
    subcategory: "辣椒酱",
    price: 18.5,
    rating: 4.5,
    reviewCount: 876,
    image: "/images/products/chili-002.jpg",
    description:
      "新鲜红辣椒搭配大蒜剁碎腌制，蒜香浓郁，辣味适中。适合做蘸料、蒸菜、拌菜。",
    specs: [
      { label: "净含量", value: "200g" },
      { label: "保质期", value: "6个月" },
      { label: "辣度", value: "🌶️🌶️" },
      { label: "产地", value: "四川眉山" },
    ],
    sales: 3456,
  },
  {
    id: "chili-003",
    name: "油泼辣子（香辣型）",
    category: "chili",
    subcategory: "辣椒酱",
    price: 15.9,
    rating: 4.7,
    reviewCount: 1890,
    image: "/images/products/chili-003.jpg",
    description:
      "陕西秦椒与四川菜籽油的完美结合，高温油泼激发辣椒的焦香。色泽红亮，香而不辣，是凉皮、凉菜的绝配。",
    specs: [
      { label: "净含量", value: "220g" },
      { label: "保质期", value: "12个月" },
      { label: "辣度", value: "🌶️" },
      { label: "产地", value: "四川成都" },
    ],
    sales: 6789,
  },

  // ---- 特色小吃 ----
  {
    id: "snack-001",
    name: "灯影牛肉丝（五香味）",
    category: "snack",
    subcategory: "特色小吃",
    price: 26.8,
    originalPrice: 32.0,
    rating: 4.6,
    reviewCount: 1567,
    image: "/images/products/snack-001.jpg",
    description:
      "百年传统工艺，牛肉片薄如蝉翼，灯光下可透出光影。搭配五香调料，酥脆化渣，回味悠长。",
    specs: [
      { label: "净含量", value: "200g" },
      { label: "保质期", value: "9个月" },
      { label: "口味", value: "五香味" },
      { label: "产地", value: "四川达州" },
    ],
    badge: "经典",
    sales: 5678,
  },
  {
    id: "snack-002",
    name: "麻辣兔腿（即食）",
    category: "snack",
    subcategory: "特色小吃",
    price: 18.8,
    rating: 4.8,
    reviewCount: 2345,
    image: "/images/products/snack-002.jpg",
    description:
      "精选农家散养兔，肉质紧实有弹性。麻辣鲜香，开袋即食，是追剧、下酒的绝佳伴侣。",
    specs: [
      { label: "净含量", value: "150g" },
      { label: "保质期", value: "6个月" },
      { label: "辣度", value: "🌶️🌶️🌶️🌶️" },
      { label: "产地", value: "四川自贡" },
    ],
    badge: "热销",
    sales: 9876,
  },
  {
    id: "snack-003",
    name: "手撕牛肉干（麻辣味）",
    category: "snack",
    subcategory: "特色小吃",
    price: 45.0,
    originalPrice: 52.0,
    rating: 4.7,
    reviewCount: 1890,
    image: "/images/products/snack-003.jpg",
    description:
      "选用牛后腿肉，手工撕制，保留肉质纤维。麻辣入味，嚼劲十足，越嚼越香。",
    specs: [
      { label: "净含量", value: "250g" },
      { label: "保质期", value: "12个月" },
      { label: "辣度", value: "🌶️🌶️🌶️" },
      { label: "产地", value: "四川成都" },
    ],
    sales: 4567,
  },

  // ---- 调味料 ----
  {
    id: "season-001",
    name: "郫县豆瓣酱（三年陈酿）",
    category: "seasoning",
    subcategory: "调味料",
    price: 16.8,
    rating: 4.9,
    reviewCount: 4567,
    image: "/images/products/season-001.jpg",
    description:
      "郫县豆瓣酱中的上品，三年陈酿，色泽红褐油润，酱香浓郁。川菜之魂，回锅肉、麻婆豆腐的必备调料。",
    specs: [
      { label: "净含量", value: "500g" },
      { label: "保质期", value: "24个月" },
      { label: "陈酿时间", value: "3年" },
      { label: "产地", value: "四川郫县" },
    ],
    badge: "招牌",
    sales: 15678,
  },
  {
    id: "season-002",
    name: "汉源花椒（特级）",
    category: "seasoning",
    subcategory: "调味料",
    price: 12.5,
    rating: 4.8,
    reviewCount: 2134,
    image: "/images/products/season-002.jpg",
    description:
      "四川汉源特产，颗颗饱满，麻香浓郁。特级品质，麻味纯正，是川菜麻辣风味的核心调料。",
    specs: [
      { label: "净含量", value: "100g" },
      { label: "保质期", value: "18个月" },
      { label: "等级", value: "特级" },
      { label: "产地", value: "四川汉源" },
    ],
    sales: 8765,
  },
  {
    id: "season-003",
    name: "麻辣鲜（复合调味料）",
    category: "seasoning",
    subcategory: "调味料",
    price: 9.9,
    rating: 4.5,
    reviewCount: 1234,
    image: "/images/products/season-003.jpg",
    description:
      "精心配比的复合调味料，麻辣鲜香一步到位。炒菜、烧烤、拌菜只需一勺，轻松做出川味家常菜。",
    specs: [
      { label: "净含量", value: "150g" },
      { label: "保质期", value: "18个月" },
      { label: "辣度", value: "🌶️🌶️🌶️" },
      { label: "产地", value: "四川成都" },
    ],
    sales: 3456,
  },

  // ---- 腊味腌制品 ----
  {
    id: "preserved-001",
    name: "川味老腊肉（烟熏）",
    category: "preserved",
    subcategory: "腊味腌制品",
    price: 58.0,
    originalPrice: 68.0,
    rating: 4.8,
    reviewCount: 1876,
    image: "/images/products/preserved-001.jpg",
    description:
      "选用农家土猪五花肉，传统柏枝烟熏工艺，肉质红亮，肥而不腻。煮熟切片，晶莹剔透，满屋飘香。",
    specs: [
      { label: "净含量", value: "500g" },
      { label: "保质期", value: "6个月" },
      { label: "工艺", value: "柏枝烟熏" },
      { label: "产地", value: "四川广元" },
    ],
    badge: "限量",
    sales: 3456,
  },
  {
    id: "preserved-002",
    name: "香肠（麻辣味）",
    category: "preserved",
    subcategory: "腊味腌制品",
    price: 42.0,
    rating: 4.7,
    reviewCount: 2345,
    image: "/images/products/preserved-002.jpg",
    description:
      "三分肥七分瘦的黄金比例，加入花椒粉和辣椒面灌制。风干后蒸煮切片，麻辣鲜香，下酒佳品。",
    specs: [
      { label: "净含量", value: "400g" },
      { label: "保质期", value: "6个月" },
      { label: "辣度", value: "🌶️🌶️🌶️" },
      { label: "产地", value: "四川成都" },
    ],
    sales: 5678,
  },
];

export const featuredProducts = products.filter((p) => p.badge === "热销" || p.badge === "爆款");
export const newProducts = products.filter((p) => p.badge === "新品");

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((p) => p.category === category);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
