import { Routes } from '@angular/router';
import { authGuard } from './core/authGuards/auth.guard';
import { roleGuard } from './core/roleGuards/role.guard'; // Role guard import kiya

// =========================================================================
// SHARED LAYOUTS
// =========================================================================
import { AuthLayoutComponent } from './shared/components/layouts/auth-layout/auth-layout.component';
import { DashboardLayoutComponent } from './shared/components/layouts/dashboard-layout/dashboard-layout.component';

// =========================================================================
// AUTH PAGES (FEATURES)
// =========================================================================
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';

// =========================================================================
// DASHBOARD & PROFILE PAGES
// =========================================================================
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ProfileComponent } from './features/profile/pages/profile/profile.component'; // Profile component import kiya

// =========================================================================
// ADMIN PANEL FEATURE COMPONENT (Added)
// =========================================================================
import { AdminPanelComponent } from './features/adminPanel/pages/admin-panel/admin-panel.component';

// =========================================================================
// BUS FEATURE COMPONENTS
// =========================================================================
import { BusListComponent } from './features/buses/pages/bus-list/bus-list.component';
import { AddBusComponent } from './features/buses/pages/add-bus/add-bus.component';
import { EditBusComponent } from './features/buses/pages/edit-bus/edit-bus.component';
import { ViewBusComponent } from './features/buses/pages/view-bus/view-bus.component';

// =========================================================================
// ROUTE FEATURE COMPONENTS
// =========================================================================
import { RouteListComponent } from './features/routes/pages/route-list/route-list.component';
import { AddRouteComponent } from './features/routes/pages/add-route/add-route.component';
import { EditRouteComponent } from './features/routes/pages/edit-route/edit-route.component';
import { ViewRouteComponent } from './features/routes/pages/view-route/view-route.component';

// =========================================================================
// DRIVER FEATURE COMPONENTS
// =========================================================================
import { DriverListComponent } from './features/drivers/pages/driver-list/driver-list.component';
import { AddDriverComponent } from './features/drivers/pages/add-driver/add-driver.component';
import { EditDriverComponent } from './features/drivers/pages/edit-driver/edit-driver.component';
import { ViewDriverComponent } from './features/drivers/pages/view-driver/view-driver.component';

// =========================================================================
// SCHEDULE FEATURE COMPONENTS
// =========================================================================
import { ScheduleListComponent } from './features/schedules/pages/schedule-list/schedule-list.component';
import { AddScheduleComponent } from './features/schedules/pages/add-schedule/add-schedule.component';
import { EditScheduleComponent } from './features/schedules/pages/edit-schedule/edit-schedule.component';
import { ViewScheduleComponent } from './features/schedules/pages/view-schedule/view-schedule.component';

// =========================================================================
// BOOKING FEATURE COMPONENTS
// =========================================================================
import { BookingListComponent } from './features/bookings/pages/booking-list/booking-list.component';
import { CreateBookingComponent } from './features/bookings/pages/create-booking/create-booking.component';
import { EditBookingComponent } from './features/bookings/pages/edit-booking/edit-booking.component';
import { ViewBookingComponent } from './features/bookings/pages/view-booking/view-booking.component';

// =========================================================================
// CUSTOMER FEATURE COMPONENTS
// =========================================================================
import { CustomerListComponent } from './features/customers/pages/customer-list/customer-list.component';
import { AddCustomerComponent } from './features/customers/pages/add-customer/add-customer.component';
import { EditCustomerComponent } from './features/customers/pages/edit-customer/edit-customer.component';
import { ViewCustomerComponent } from './features/customers/pages/view-customer/view-customer.component';

// =========================================================================
// TRACKING FEATURE COMPONENTS
// =========================================================================
import { LiveTrackingComponent } from './features/trackings/pages/live-tracking/live-tracking.component';
import { BusDetailTrackingComponent } from './features/trackings/pages/bus-detail-tracking/bus-detail-tracking.component';

// =========================================================================
// REPORTS FEATURE COMPONENT
// =========================================================================
import { ReportsDashboardComponent } from './features/reports/pages/reports-dashboard/reports-dashboard.component';

// =========================================================================
// SETTINGS FEATURE COMPONENT
// =========================================================================
import { SettingsComponent } from './features/settings/pages/settings/settings.component';

// =========================================================================
// PAYMENT & ERROR COMPONENTS
// =========================================================================
import { CheckoutComponent } from './features/payments/page/checkout/checkout.component';
import { PaymentSuccessComponent } from './features/payments/page/payment-success/payment-success.component';
import { NotFoundErrorPageComponent } from './shared/components/not-found-error-page/not-found-error-page.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth/login',
    pathMatch: 'full',
  },

  // 1. AUTHENTICATION ROUTES
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
    ],
  },

  // 2. MAIN APPLICATION ROUTES (Protected with authGuard & roleGuard)
  {
    path: '',
    component: DashboardLayoutComponent,
    canActivate: [authGuard], 
    children: [
      { 
        path: 'dashboard', 
        component: DashboardComponent,
        canActivate: [roleGuard],
        data: { roles: ['admin', 'driver', 'customer'] }
      },

      // Profile Route (Accessible by Admin, Driver, Customer)
      { 
        path: 'profile', 
        component: ProfileComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['admin', 'driver', 'customer'] } 
      },

      // Admin Panel Management (Admin Only)
      { 
        path: 'admin-panel', 
        component: AdminPanelComponent, 
        canActivate: [roleGuard], 
        data: { roles: ['admin'] } 
      },

      // Bus Management (Admin Only)
      { path: 'bus', component: BusListComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'bus/add', component: AddBusComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'bus/edit/:id', component: EditBusComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'bus/view/:id', component: ViewBusComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },

      // Route Management (Admin Only)
      { path: 'routes', component: RouteListComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'routes/add', component: AddRouteComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'routes/edit/:id', component: EditRouteComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'routes/view/:id', component: ViewRouteComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },

      // Driver Management (Admin Only)
      { path: 'drivers', component: DriverListComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'drivers/add', component: AddDriverComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'drivers/edit/:id', component: EditDriverComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'drivers/view/:id', component: ViewDriverComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },

      // Schedule Management (Admin & Driver)
      { path: 'schedules', component: ScheduleListComponent, canActivate: [roleGuard], data: { roles: ['admin', 'driver'] } },
      { path: 'schedules/add', component: AddScheduleComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'schedules/edit/:id', component: EditScheduleComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'schedules/view/:id', component: ViewScheduleComponent, canActivate: [roleGuard], data: { roles: ['admin', 'driver'] } },

      // Booking Management (Admin & Customer)
      { path: 'bookings', component: BookingListComponent, canActivate: [roleGuard], data: { roles: ['admin', 'customer'] } },
      { path: 'bookings/create', component: CreateBookingComponent, canActivate: [roleGuard], data: { roles: ['admin', 'customer'] } },
      { path: 'bookings/edit/:id', component: EditBookingComponent, canActivate: [roleGuard], data: { roles: ['admin', 'customer'] } },
      { path: 'bookings/view/:id', component: ViewBookingComponent, canActivate: [roleGuard], data: { roles: ['admin', 'customer'] } },

      // Customer Management (Admin Only)
      { path: 'customers', component: CustomerListComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'customers/add', component: AddCustomerComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'customers/edit/:id', component: EditCustomerComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
      { path: 'customers/view/:id', component: ViewCustomerComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },

      // Payments (Admin & Customer)
      { path: 'payments/checkout', component: CheckoutComponent, canActivate: [roleGuard], data: { roles: ['admin', 'customer'] } },
      { path: 'payments/success', component: PaymentSuccessComponent, canActivate: [roleGuard], data: { roles: ['admin', 'customer'] } },
      { path: 'payments/success/:id', component: PaymentSuccessComponent, canActivate: [roleGuard], data: { roles: ['admin', 'customer'] } },

      // Live Tracking (Admin & Driver)
      { path: 'tracking', component: LiveTrackingComponent, canActivate: [roleGuard], data: { roles: ['admin', 'driver'] } },
      { path: 'tracking/detail/:id', component: BusDetailTrackingComponent, canActivate: [roleGuard], data: { roles: ['admin', 'driver'] } },

      // Reports & Analytics (Admin Only)
      { path: 'reports', component: ReportsDashboardComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },

      // Application Settings (Admin Only)
      { path: 'settings', component: SettingsComponent, canActivate: [roleGuard], data: { roles: ['admin'] } },
    ],
  },

  // 3. WILDCARD FALLBACK
  {
    path: '**',
    component: NotFoundErrorPageComponent,
  },
];