/**
 * =========================================================================
 * USER PROFILE MODEL INTERFACE
 * =========================================================================
 * Yeh interface transport application mein user ki profile ki information 
 * (jaise naam, email, phone number, aur gender) ko define karta hai.
 */
export interface UserProfile {
  // Unique identification number (database ya backend se generate hota hai)
  id?: number;

  // User ka poora naam
  full_name: string;

  // User ki active email address (login ya notifications ke liye)
  email: string;

  // User ka contact / mobile number (booking alerts aur updates ke liye)
  phone_number: string;

  // User ka gender (Male, Female, ya Other options)
  gender: 'Male' | 'Female' | 'other';
}