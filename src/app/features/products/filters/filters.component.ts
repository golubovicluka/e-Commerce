import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
    selector: 'app-filters',
    templateUrl: './filters.component.html',
    styleUrls: ['./filters.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: []
})
export class FiltersComponent {
  @Input() categories: any[] = [];

  // TODO: event emmiter with selected filters
  selectedFilters: any[] = [];
  @Output() filtersObject = new EventEmitter()

  changeFilter(filterObject: any) {
    this.filtersObject.emit(filterObject);
  }

  onFilterToggle(name: string, checked: boolean): void {
    this.selectedFilters = checked
      ? [...this.selectedFilters, name]
      : this.selectedFilters.filter((filter) => filter !== name);
    this.changeFilter(this.selectedFilters);
  }

}
