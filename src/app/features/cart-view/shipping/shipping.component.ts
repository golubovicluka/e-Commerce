import { Component } from '@angular/core';

@Component({
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss']
})
export class ShippingComponent {
  name!: string;
  lastName!: string;
  address!: string;
  postalCode!: number;
  city!: string;
  areaCode!: string;
  phoneNumber!: string;
  additionalInformation!: string;
  saveFormDetails!: string;
  phonePrefix!: string;
  apartmentNumber!: number;

}
