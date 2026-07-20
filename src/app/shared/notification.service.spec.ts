import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    vi.useFakeTimers();
    service = new NotificationService();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('publishes and dismisses notifications through a readonly signal', () => {
    service.add({ severity: 'success', summary: 'Added', detail: 'Added to cart' });

    expect(service.notifications()).toMatchObject([
      { severity: 'success', summary: 'Added', detail: 'Added to cart' },
    ]);

    service.dismiss(service.notifications()[0].id);
    expect(service.notifications()).toEqual([]);
  });

  it('automatically removes a notification after its display interval', () => {
    service.add({ severity: 'info', summary: 'Saved', detail: 'Wishlist updated' });

    vi.advanceTimersByTime(4500);

    expect(service.notifications()).toEqual([]);
  });
});
