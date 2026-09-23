import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * 1. PAKISTANI PHONE NUMBER VALIDATOR
   * Yeh validator Pakistani mobile formats (jaise 03001234567, +923001234567, 00923001234567) 
   * ya general 10 se 15 digits ke international formats ko validate karta hai.
   */
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      // Agar field khali ho toh koi error return nahi karna (required validator alag se handle karega)
      if (!value) {
        return null; 
      }

      // Regex check: Pehla pattern local/Pakistani formats ke liye, doosra general international formats ke liye
      return /^((\+92)|(0092)|(0))?3\d{9}$/.test(value) ||
        /^\+?\d{10,15}$/.test(value)
        ? null
        : { invalidPhone: true }; // Agar match na ho toh invalidPhone error return karna
    };
  }

  /**
   * 2. PAKISTANI CNIC VALIDATOR
   * Yeh validator Pakistani CNIC numbers ko dashes ke sath (e.g. 42101-1234567-1) 
   * ya bina dashes ke (e.g. 4210112345671 - exactly 13 digits) validate karta hai.
   */
  static cnic(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;

      // Agar field khali ho toh error return nahi karna
      if (!value) {
        return null;
      }

      // Regex check: 5 digits + dash + 7 digits + dash + 1 digit, OR exactly 13 digits
      return /^(\d{5}-\d{7}-\d|\d{13})$/.test(value)
        ? null
        : { invalidCnic: true }; // Agar format ghalat ho toh invalidCnic error return karna
    };
  }
}