/**
 * @file custom.validators.ts
 * @description Custom Form Validators (Pakistani Phone, CNIC, Date Comparison, aur Bus Number Plate validation ke liye)
 */

import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  
  /**
   * @method phoneNumber
   * @description Pakistani Mobile Number Validator (e.g. 03001234567 ya +923001234567 format ko validate karta hai)
   */
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      // Agar field khali hai toh null return karo (Required check alag se Validators.required sambhalega)
      if (!control.value) return null; 
      
      // Regex check: +92 ya 0 se start ho, uske baad 3 ho, aur total 10 digits hon
      const valid = /^(\+92|0)?3\d{9}$/.test(control.value);
      return valid ? null : { invalidPhone: true };
    };
  }

  /**
   * @method cnic
   * @description Pakistani CNIC Validator (e.g. dashes ke sath 42101-1234567-1 ya baghair dashes ke 4210112345671)
   */
  static cnic(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Dashes (-) ko remove karke sirf digits check kar rahe hain
      const cleanCNIC = control.value.replace(/-/g, '');
      const valid = /^\d{13}$/.test(cleanCNIC); // Total 13 digits hone chahiye
      
      return valid ? null : { invalidCnic: true };
    };
  }

  /**
   * @method dateAfter
   * @description Date Comparison Validator (Yeh ensure karta hai ke Arrival Date hamesha Departure Date ke baad ki ho)
   * @param departureControlName Form group ke andar departure date control ka naam
   * @param arrivalControlName Form group ke andar arrival date control ka naam
   */
  static dateAfter(departureControlName: string, arrivalControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const depVal = formGroup.get(departureControlName)?.value;
      const arrVal = formGroup.get(arrivalControlName)?.value;

      // Agar koi bhi date missing hai toh validation skip karo
      if (!depVal || !arrVal) return null;

      const depDate = new Date(depVal);
      const arrDate = new Date(arrVal);

      // Agar arrival date departure date se pehle ya barabar ho toh error set kar do
      if (arrDate <= depDate) {
        formGroup.get(arrivalControlName)?.setErrors({ dateInvalid: true });
        return { dateInvalid: true };
      }

      return null;
    };
  }

  /**
   * @method busPlateNumber
   * @description Bus License Plate Validator (e.g. BSA-102, KHI-9988 format ko match karta hai)
   */
  static busPlateNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      // Regex: 2 ya 3 alphabets, phir dash (-), phir 3 ya 4 digits (Case insensitive)
      const valid = /^[A-Z]{2,3}-\d{3,4}$/i.test(control.value.trim());
      return valid ? null : { invalidPlate: true };
    };
  }
}