export type CatalogAdminRole = 'admin' | 'editor';
export type CatalogProductStatus = 'draft' | 'active' | 'archived';
export type CatalogAvailability = 'por-confirmar' | 'en-stock' | 'sobre-pedido' | 'agotado';

export interface AdminSession {
  userId: string;
  role: CatalogAdminRole;
  displayName: string | null;
}

export interface CatalogOption {
  id: string;
  name: string;
}

export interface AdminCatalogItem {
  productId: string;
  variantId: string;
  sourceRef: string;
  productSlug: string;
  name: string;
  brandId: string;
  brandName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  status: CatalogProductStatus;
  dataStatus: 'base-inicial' | 'requiere-revision';
  sourceRow: number | null;
  sku: string;
  variantSlug: string;
  manufacturerModel: string;
  sourceModel: string;
  color: string | null;
  size: string | null;
  specifications: string;
  priceMxn: number | null;
  stock: number | null;
  availability: CatalogAvailability;
  published: boolean;
  updatedAt: string;
}
