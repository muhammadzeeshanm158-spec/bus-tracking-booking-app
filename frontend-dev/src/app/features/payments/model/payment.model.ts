/**
 * =========================================================================
 * PAYMENT MODEL INTERFACE (Synced with Backend)
 * =========================================================================
 */
export interface Payment {
  // Unique identification number
  id?: string;

  // Kis booking ke khilaf yeh payment ki gayi hai
  bookingId: string;

  // Total payable amount
  amount: number;

  // Payment method (Backend ke allowed methods ke sath exact match - Capitalized)
  paymentMethod: 'Card' | 'Cash' | 'JazzCash' | 'Easypaisa';

  // Current payment status (Backend ke sath synced: 'Paid' instead of 'Completed')
  status: 'Pending' | 'Paid' | 'Failed' | 'Refunded';

  // Transaction ID ya reference number
  transactionId?: string;

  // Payment timestamp
  createdAt?: string;
}