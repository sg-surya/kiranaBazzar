import { UserProfile, Product, Order, Category } from './types';

export const CATEGORIES: Category[] = [
  { id: 'grains_pulses', name: 'Grains & Pulses', icon: '🌾' },
  { id: 'spices_masalas', name: 'Spices & Masalas', icon: '🌶️' },
  { id: 'oils_ghee', name: 'Oils & Ghee', icon: '🧴' },
  { id: 'tea_beverages', name: 'Tea & Beverages', icon: '☕' },
  { id: 'packaged_snacks', name: 'Packaged Snacks', icon: '🍪' },
  { id: 'cleaning_hygiene', name: 'Cleaning & Hygiene', icon: '🧼' }
];

export const MOCK_PRODUCT_PRESETS = [
  {
    name: 'Shaktibhag Premium Atta (50kg)',
    category: 'grains_pulses',
    price: 1350,
    description: 'High quality whole wheat gold grain Atta directly sourced from MP farms. Fully packed and hygienic for retail distribute.',
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'India Gate Basmati Rice Mini (25kg)',
    category: 'grains_pulses',
    price: 1650,
    description: 'Aromatic long-grain premium basmati rice suitable for daily bulk sales and restaurants.',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Everest Tikhalal Chilli Powder (1kg Pack)',
    category: 'spices_masalas',
    price: 320,
    description: 'Fine ground premium red chillies. Gives perfect fiery red color and rich hot taste to your curries.',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Fortune Pure Mustard Oil (15 Litre Tin)',
    category: 'oils_ghee',
    price: 2150,
    description: 'Cold pressed Kachi Ghani mustard oil with high pungency and standard B2B wholesale shelf life.',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Wagh Bakri Premium Leaf Tea (5kg Sack)',
    category: 'tea_beverages',
    price: 1480,
    description: 'Strong Assam CTC leaf tea blend. Excellent color, taste and high profit margin for local Kirana shops.',
    image: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Parle-G Gold Biscuits Carton (120 Packs)',
    category: 'packaged_snacks',
    price: 540,
    description: 'The golden original glucose biscuits wholesale pack. Quick rotation, highest frequency customer demand item.',
    image: 'https://images.unsplash.com/photo-1558961309-dbdf0003ed29?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Vim Dishwash Liquid Bulk (5 Litre Can)',
    category: 'cleaning_hygiene',
    price: 490,
    description: 'Lemon power grease cutter liquid. High concentration, ideal supply for bulk local retail distribution.',
    image: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&q=80&w=400'
  }
];

export const SEEDED_USERS: UserProfile[] = [
  {
    uid: 'owner-rajesh',
    name: 'Rajesh Kumar (Owner)',
    phone: '9999911111',
    whatsapp: '9999911111',
    address: 'Main Wholesale Market Area, Block-C, Delhi',
    pincode: '110006',
    role: 'Owner',
    approvalStatus: 'approved',
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    uid: 'seller-goel',
    name: 'Anil Goel (Goel Wholesalers)',
    phone: '9876543210',
    whatsapp: '9876543210',
    address: 'Sadar Gate Wholesale Complex, Shop B-12, Delhi',
    pincode: '110001',
    role: 'Seller',
    approvalStatus: 'approved',
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    uid: 'seller-pending',
    name: 'Suresh Kumar (Suresh & Sons)',
    phone: '9111122222',
    whatsapp: '9111122222',
    address: 'Galla Mandi Row-3, Lucknow',
    pincode: '226012',
    role: 'Seller',
    approvalStatus: 'pending',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    uid: 'dukan-ramesh',
    name: 'Ramesh Gupta (Gupta Kirana Store)',
    phone: '9888877777',
    whatsapp: '9888877777',
    address: 'Sector 5 Corner Shop, Rohini, Delhi',
    pincode: '110085',
    role: 'Dukandar',
    approvalStatus: 'approved',
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  },
  {
    uid: 'dukan-pending',
    name: 'Verma Provision Store',
    phone: '9333344444',
    whatsapp: '9333344444',
    address: 'Chowk Crossing Bazar, Lucknow',
    pincode: '226003',
    role: 'Dukandar',
    approvalStatus: 'pending',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

export const SEEDED_PRODUCTS: Product[] = [
  {
    id: 'prod-atta',
    name: 'Shaktibhag Premium Atta (50kg)',
    description: 'High quality MP wheat flour in robust 50kg bags. Perfect for all retail distribution in regional regions.',
    price: 1320,
    stockQuantity: 40,
    category: 'grains_pulses',
    image: 'https://images.unsplash.com/photo-1574316071802-0d684efa7bf5?auto=format&fit=crop&q=80&w=400',
    deliveryAreas: {
      cities: ['Delhi', 'Noida', 'Gurugram'],
      pincodes: ['110001', '110085', '110006', '201301']
    },
    sellerId: 'seller-goel',
    sellerName: 'Anil Goel (Goel Wholesalers)',
    status: 'Active',
    createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'prod-rice',
    name: 'India Gate Basmati Rice Mini (25kg Bag)',
    description: 'Grains are aged for beautiful scent and stretch. B2B high rotation inventory.',
    price: 1650,
    stockQuantity: 25,
    category: 'grains_pulses',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
    deliveryAreas: {
      cities: ['Delhi', 'Noida'],
      pincodes: ['110001', '110085']
    },
    sellerId: 'seller-goel',
    sellerName: 'Anil Goel (Goel Wholesalers)',
    status: 'Active',
    createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'prod-oil',
    name: 'Fortune Pure Mustard Oil (15L Tin)',
    description: 'Fresh aromatic cold pressed mustard oil tin suited for retail trade.',
    price: 2150,
    stockQuantity: 15,
    category: 'oils_ghee',
    image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&q=80&w=400',
    deliveryAreas: {
      cities: ['Delhi', 'Noida', 'Lucknow'],
      pincodes: ['110001', '110085', '226012']
    },
    sellerId: 'seller-goel',
    sellerName: 'Anil Goel (Goel Wholesalers)',
    status: 'Active',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'prod-chilli',
    name: 'Everest Tikhalal Chilli Powder (1kg Pack)',
    description: 'Spicy chili powder of high pungency and standard package retail shelf life.',
    price: 320,
    stockQuantity: 0,
    category: 'spices_masalas',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=400',
    deliveryAreas: {
      cities: ['Delhi', 'Lucknow'],
      pincodes: ['110001', '226012']
    },
    sellerId: 'seller-goel',
    sellerName: 'Anil Goel (Goel Wholesalers)',
    status: 'Sold Out',
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  }
];

export const SEEDED_ORDERS: Order[] = [
  {
    id: 'ord-1001',
    productId: 'prod-atta',
    productName: 'Shaktibhag Premium Atta (50kg)',
    sellerId: 'seller-goel',
    buyerId: 'dukan-ramesh',
    buyerName: 'Ramesh Gupta (Gupta Kirana Store)',
    buyerPhone: '9888877777',
    address: 'Sector 5 Corner Shop, Rohini, Delhi',
    pincode: '110085',
    price: 1320,
    quantity: 5,
    totalAmount: 6600,
    status: 'Delivered',
    createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString()
  },
  {
    id: 'ord-1002',
    productId: 'prod-rice',
    productName: 'India Gate Basmati Rice Mini (25kg Bag)',
    sellerId: 'seller-goel',
    buyerId: 'dukan-ramesh',
    buyerName: 'Ramesh Gupta (Gupta Kirana Store)',
    buyerPhone: '9888877777',
    address: 'Sector 5 Corner Shop, Rohini, Delhi',
    pincode: '110085',
    price: 1650,
    quantity: 2,
    totalAmount: 3300,
    status: 'Pending',
    createdAt: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
  }
];

// Helper to initialize local storage
export function initializeLocalStorage() {
  if (!localStorage.getItem('kb_users')) {
    localStorage.setItem('kb_users', JSON.stringify(SEEDED_USERS));
  }
  if (!localStorage.getItem('kb_products')) {
    localStorage.setItem('kb_products', JSON.stringify(SEEDED_PRODUCTS));
  }
  if (!localStorage.getItem('kb_orders')) {
    localStorage.setItem('kb_orders', JSON.stringify(SEEDED_ORDERS));
  }
}

// Get operations
export function getUsers(): UserProfile[] {
  initializeLocalStorage();
  const raw = localStorage.getItem('kb_users');
  return raw ? JSON.parse(raw) : SEEDED_USERS;
}

export function getProducts(): Product[] {
  initializeLocalStorage();
  const raw = localStorage.getItem('kb_products');
  return raw ? JSON.parse(raw) : SEEDED_PRODUCTS;
}

export function getOrders(): Order[] {
  initializeLocalStorage();
  const raw = localStorage.getItem('kb_orders');
  return raw ? JSON.parse(raw) : SEEDED_ORDERS;
}

// Save operations
export function saveUsers(users: UserProfile[]) {
  localStorage.setItem('kb_users', JSON.stringify(users));
}

export function saveProducts(products: Product[]) {
  localStorage.setItem('kb_products', JSON.stringify(products));
}

export function saveOrders(orders: Order[]) {
  localStorage.setItem('kb_orders', JSON.stringify(orders));
}
