import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
  @Input() name!: string;
  @Input() description!: string;
  @Input() subcategory!: string;
  @Input() image!: string;
  @Input() id!: number;
  @Input() inStock!: number;
  @Input() price!: number;
  @Input() productId!: number;
  @Output() addedToWishList = new EventEmitter();
  @Output() removedFromWishList = new EventEmitter();

  public isAddedToWishList: boolean = false;
  ngOnInit() { }

  constructor(private _messageService: MessageService) { }

  // TODO: convert to event emitter and call from products-view
  addToWishList() {
    this.isAddedToWishList = !this.isAddedToWishList;

    if (this.isAddedToWishList) {
      this.addedToWishList.emit(this);
      this._messageService.add({ severity: 'success', summary: 'Added', detail: 'Added to wishlist' })
    } else {
      this.removedFromWishList.emit(this);
      this._messageService.add({ severity: 'info', summary: 'Removed', detail: 'Removed from wishlist' })
    }

  }
}
