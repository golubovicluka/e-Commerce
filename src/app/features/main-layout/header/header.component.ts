import { Component, OnInit } from '@angular/core';
import { StoreService } from '../../../shared/store.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  wishListItems!: string;

  constructor(private _storeService: StoreService) { }

  ngOnInit() {
    this._storeService.getWishListItems().subscribe((data: any) => {
      this.wishListItems = data.length.toString();
    })
  }

}
