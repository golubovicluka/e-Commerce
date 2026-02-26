import { NgModule } from '@angular/core';
import { FallbackImageDirective } from './fallback-image.directive';

@NgModule({
  declarations: [FallbackImageDirective],
  exports: [FallbackImageDirective]
})
export class UiSharedModule {}
