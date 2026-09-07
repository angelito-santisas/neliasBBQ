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

export type InventoryStatus = 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
export type InventoryMovementType = 'RECEIVED' | 'USED' | 'CORRECTION';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
  status: InventoryStatus;
  updatedAt: string;
}

export interface CreateInventoryItemRequest {
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  unitCost: number;
}

export interface AdjustInventoryRequest {
  quantity: number;
  movementType: InventoryMovementType;
  note: string;
}
