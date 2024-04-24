import { Injectable } from '@angular/core';

import { Observable, Observer, Subject } from 'rxjs';
declare var YT: any;
@Injectable({
  providedIn: 'root',
})
export class YtserviceService {
  private player: any;
  private state_changed = false;

  private currentPlayerTrackId = new Subject<void>();
  constructor() {}

  currentPlayerTrackId$ = this.currentPlayerTrackId.asObservable();

  loadPlayer(): Observable<any> {
    return new Observable((observer: Observer<any>) => {
      if (typeof YT === 'undefined' || typeof YT.Player === 'undefined') {
        try {
          (window as any).onYouTubeIframeAPIReady = () => {
            this.createPlayer(observer);
          };

          const script = document.createElement('script');
          script.src = 'https://www.youtube.com/iframe_api';
          document.body.appendChild(script);
        } catch {
          return;
        }
      } else {
        this.createPlayer(observer);
      }
    });
  }

  private createPlayer(observer: Observer<any>): void {
    this.player = new YT.Player('youtube-player', {
      events: {
        onReady: (event: any) => observer.next(event.target),
        onError: (event: any) => observer.error(event.data),
        onStateChange: (event: any) => this.handlePlayerStateChange(event),
      },
    });
  }
  stopPlayer() {
    this.state_changed = false;
  }
  private handlePlayerStateChange(event: any): void {
    if (!this.state_changed) {
      if (event.data === 3 || event.data === 1) {
        this.state_changed = true;
      }
    }
    if (this.state_changed) {
      if (event.data === 0) {
        this.currentPlayerTrackId.next();
        this.state_changed = false;
      }
    }
  }
}
