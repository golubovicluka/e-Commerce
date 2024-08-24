import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss']
})
export class CategoryComponent implements OnInit {
  @Input() name!: string;
  @Input() id!: number;

  @Output() applyCategoryFilter = new EventEmitter();

  categoryImage = 'https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923__480.jpg';

  ngOnInit(): void { }

  openProductsPage(categoryName: string) {
    this.applyCategoryFilter.emit(categoryName);
  }

  getCategoryImage(name: string) {
    if (name === 'Home') {
      return "https://cdn.pixabay.com/photo/2016/11/18/17/20/living-room-1835923__480.jpg";
    }
    if (name === 'Electronics') {
      return "https://images.pexels.com/photos/1229861/pexels-photo-1229861.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500";
    }
    if (name === 'Sports & Outdoors') {
      return "https://img.freepik.com/premium-photo/top-view-copy-space-sport-equipment-background-generative-art-by-ai_35887-2045.jpg"
    }
    if (name === 'Kitchen') {
      return "https://storables.com/wp-content/uploads/2019/11/kitchen-with-modern-grey-wallpaper-1024x683.jpeg";
    }
    return
  }
}
