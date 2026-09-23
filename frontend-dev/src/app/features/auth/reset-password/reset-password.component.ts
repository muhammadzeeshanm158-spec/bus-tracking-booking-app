import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  imports: [RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {

  showPassword = false;
  showConfirmPassword = false;

  togglePassword():void{
     this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
  this.showConfirmPassword = !this.showConfirmPassword;
}

}
