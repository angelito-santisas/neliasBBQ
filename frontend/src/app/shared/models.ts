export interface MenuItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
}

export interface CartLine {
  item: MenuItem;
  quantity: number;
}

export interface OrderRequest {
  items: Array<{ menuItemId: string; quantity: number }>;
  specialInstructions: string;
}

export interface OrderResponse {
  id: string;
  subtotal: number;
  serviceFee: number;
  total: number;
  status: string;
  createdAt: string;
}

export interface FeedbackRequest {
  overallRating: number;
  foodQualityRating: number | null;
  wouldRecommend: boolean;
  comments: string;
  anonymous: boolean;
}

export interface CreatedResource {
  id: string;
}
