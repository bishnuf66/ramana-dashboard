export interface PaymentOption {
  id: string;
  payment_type: 'esewa' | 'khalti' | 'bank_transfer';
  payment_number: string;
  qr_image_url: string | null;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface PaymentOptionInsert {
  payment_type: 'esewa' | 'khalti' | 'bank_transfer';
  payment_number: string;
  qr_image_url?: string | null;
  status?: 'active' | 'inactive';
}

export interface PaymentOptionUpdate {
  payment_type?: 'esewa' | 'khalti' | 'bank_transfer';
  payment_number?: string;
  qr_image_url?: string | null;
  status?: 'active' | 'inactive';
}
