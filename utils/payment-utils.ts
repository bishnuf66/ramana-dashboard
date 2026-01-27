import type { PaymentOption } from "@/types/payment.types";

export interface PaymentOptionsResponse {
  paymentOptions: PaymentOption[];
}

export async function fetchPaymentOptions(): Promise<PaymentOption[]> {
  try {
    const response = await fetch('/api/payment-options');
    
    if (!response.ok) {
      throw new Error('Failed to fetch payment options');
    }
    
    const data: PaymentOptionsResponse = await response.json();
    return data.paymentOptions;
  } catch (error) {
    console.error('Error fetching payment options:', error);
    return [];
  }
}

export function getPaymentIcon(type: string) {
  switch (type) {
    case 'esewa':
      return '📱'; // You can replace with actual icons
    case 'khalti':
      return '💳';
    case 'bank_transfer':
      return '🏦';
    default:
      return '💳';
  }
}

export function getPaymentLabel(type: string) {
  switch (type) {
    case 'esewa':
      return 'eSewa';
    case 'khalti':
      return 'Khalti';
    case 'bank_transfer':
      return 'Bank Transfer';
    default:
      return type;
  }
}

export function getPaymentFieldLabel(type: string) {
  switch (type) {
    case 'esewa':
      return 'eSewa Phone Number';
    case 'khalti':
      return 'Khalti Phone Number';
    case 'bank_transfer':
      return 'Bank Account Number';
    default:
      return 'Payment Number';
  }
}
