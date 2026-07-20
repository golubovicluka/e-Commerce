import { Component, ChangeDetectionStrategy } from '@angular/core';
import { HeaderComponent } from './features/main-layout/header/header.component';
import { RouterOutlet } from '@angular/router';
import { FooterComponent } from './features/main-layout/footer/footer.component';
import { ToastComponent } from './shared/toast/toast.component';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [HeaderComponent, RouterOutlet, FooterComponent, ToastComponent]
})
export class AppComponent {
  title = 'Webshop';
}
