import { Subscription } from "rxjs";

export class SubscriptionContainer {
  private subs: any[] = [];

  add(s: Subscription | undefined) {
    this.subs.push(s)
  }

  dispose() {
    this.subs.forEach(s => s.unsubscribe());
  }

}
