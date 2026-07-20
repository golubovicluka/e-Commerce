import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
    selector: 'app-footer',
    templateUrl: './footer.component.html',
    styleUrls: ['./footer.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RouterLink]
})
export class FooterComponent {

  constructor(private router: Router) { }

  openLink(link: string) {
    window.open(link, '_blank', 'noopener,noreferrer');
  }

  toHome() {
    this.router.navigate(['/home']);
  }
}
