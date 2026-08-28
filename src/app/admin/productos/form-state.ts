export interface CatalogFormState {
  status: 'idle' | 'success' | 'error';
  message: string | null;
  fieldErrors: Record<string, string>;
}

export const initialCatalogFormState: CatalogFormState = {
  status: 'idle',
  message: null,
  fieldErrors: {},
};
