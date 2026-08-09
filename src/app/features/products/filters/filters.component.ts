import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CatalogCategory } from '../products.service';

@Component({
  selector: 'app-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersComponent {
  readonly categories = input<readonly CatalogCategory[]>([]);
  readonly categoryId = input<number | null>(null);
  readonly selectedSubcategoryIds = input<readonly number[]>([]);
  readonly filtersChange = output<number[]>();

  readonly visibleCategories = computed(() => {
    const categoryId = this.categoryId();
    return categoryId === null
      ? this.categories()
      : this.categories().filter((category) => category.id === categoryId);
  });

  isSelected(subcategoryId: number): boolean {
    return this.selectedSubcategoryIds().includes(subcategoryId);
  }

  onFilterToggle(subcategoryId: number, checked: boolean): void {
    const selected = this.selectedSubcategoryIds();
    const next = checked
      ? [...new Set([...selected, subcategoryId])]
      : selected.filter((id) => id !== subcategoryId);
    this.filtersChange.emit(next);
  }
}
