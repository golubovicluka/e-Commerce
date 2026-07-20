import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
    templateUrl: './shipping.component.html',
    styleUrls: ['./shipping.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [FormsModule, RouterLink]
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
  saveFormDetails = 'saveDetails';
  saveDetails = false;
  phonePrefix!: string;
  apartmentNumber!: number;

}
