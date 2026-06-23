export type UserRole = 'Owner' | 'Seller' | 'Dukandar';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface UserProfile {
  uid: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  pincode: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  createdAt: string;
  onboarded?: boolean;
  shopPhoto?: string;
  deliverableCities?: string[];
  deliverablePincodes?: string[];
  gstNumber?: string;
  minOrderValue?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stockQuantity: number;
  category: string;
  image: string;
  videoUrl?: string;
  unit?: string;
  brand?: string;
  weight?: string;
  packaging?: string;
  minMOQ?: number;
  specifications?: string;
  deliveryAreas: {
    cities: string[];
    pincodes: string[];
  };
  sellerId: string;
  sellerName: string;
  status: 'Active' | 'Inactive' | 'Sold Out';
  createdAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  sellerId: string;
  buyerId: string;
  buyerName: string;
  buyerPhone: string;
  address: string;
  pincode: string;
  price: number;
  quantity: number;
  totalAmount: number;
  status: 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
}
