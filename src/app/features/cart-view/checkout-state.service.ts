import { computed, Injectable, signal } from '@angular/core';

export const POSTAL_CODE_PATTERN = /^\d{5}$/;
export const PHONE_PATTERN = /^\+?[0-9 ()/-]{6,20}$/;

export interface ShippingDetails {
  firstName: string;
  lastName: string;
  address: string;
  apartment: string;
  postalCode: string;
  city: string;
  phone: string;
  deliveryNotes: string;
}

export function createEmptyShippingDetails(): ShippingDetails {
  return {
    firstName: '',
    lastName: '',
    address: '',
    apartment: '',
    postalCode: '',
    city: '',
    phone: '',
    deliveryNotes: '',
  };
}

export function hasCompleteShippingDetails(details: ShippingDetails): boolean {
  return Boolean(
    details.firstName.trim().length >= 2 &&
      details.lastName.trim().length >= 2 &&
      details.address.trim().length >= 5 &&
      POSTAL_CODE_PATTERN.test(details.postalCode.trim()) &&
      details.city.trim().length >= 2 &&
      PHONE_PATTERN.test(details.phone.trim()),
  );
}

@Injectable({ providedIn: 'root' })
export class CheckoutStateService {
  readonly shippingDetails = signal<ShippingDetails>(createEmptyShippingDetails());
  readonly shippingReady = computed(() => hasCompleteShippingDetails(this.shippingDetails()));
}
