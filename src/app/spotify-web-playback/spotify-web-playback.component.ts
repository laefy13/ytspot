import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import * as store from 'store2';
import { Inject, PLATFORM_ID } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
import { v6 as uuidv6 } from 'uuid';

declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}

@Component({
  selector: 'app-spotify-web-playback',
  standalone: true,
  imports: [CommonModule, LoadingComponent, FormsModule],
  templateUrl: './spotify-web-playback.component.html',
  styleUrl: './spotify-web-playback.component.css',
})
export class SpotifyWebPlaybackComponent implements OnInit {
  @Input() player_state!: number;
  @Input() img_url!: string;
  @Input() update_class!: boolean;

  player: any;
  api_link = environment.API_URL;
  login_link = this.api_link + 'auth/login/';
  access_token: string = '';
  spotify_volume = 50;
  private position_changed = false;
  device_ready = false;
  spot_to_yt = false;
  token_expired = false;
  isBrowser: boolean;
  token_refreshing = false;
  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private spotifyService: SpotifyService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async ngOnInit(): Promise<void> {
    if (!this.isBrowser) return;
    let id = store.default.get('id');
    let browser_id = store.default.get('browser-id');
    if (browser_id === null) {
      browser_id = uuidv6();
      store.default.set('browser-id', browser_id);
    }
    this.login_link += browser_id;

    if (id === null) {
      this.route.queryParams.subscribe(async (params) => {
        if ('id' in params) id = params['id'];
        else return;

        store.default.set('id', id);
        await this.getToken(id, browser_id);

        this.router.navigate([], {
          queryParams: {
            id: null,
          },
          queryParamsHandling: 'merge',
        });
      });
    } else {
      await this.getToken(id, browser_id);
    }
  }

  private async getToken(id: string, browser_id: string): Promise<void> {
    if (id === null || browser_id === null) return;
    const link = this.api_link + 'token';
    const headers = new HttpHeaders({
      'X-Spotify-UUID': id,
      'X-Browser-ID': browser_id,
    });
    this.http.get<any>(link, { headers }).subscribe({
      next: (response) => {
        const access_token = response.token;
        if (response.expired) {
          this.access_token = access_token;
          this.token_expired = true;
          return null;
        } else if (access_token === null) return null;

        this.access_token = access_token;

        this.initializeSpotifyPlayer();
        return;
      },
      error: (error) => {
        return;
      },
    });
  }

  private initializeSpotifyPlayer() {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    const temp_vol = store.default.get('spot-volume');
    this.spotify_volume = temp_vol ? temp_vol : this.spotify_volume;
    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb: (arg0: any) => void) => {
          cb(this.access_token);
        },
        volume: this.spotify_volume / 100,
      });

      this.player.addListener('ready', ({ device_id }: any) => {
        store.default.set('device_id', device_id);
      });

      this.player.connect().then((success: any) => {
        if (success) {
          this.device_ready = true;
        }
      });
      this.player.addListener(
        'player_state_changed',
        ({ position, duration, track_window: { current_track } }: any) => {
          if (position > 0) {
            this.player.getCurrentState().then((state: any) => {
              if (!state) return;
              if (!state.paused) {
                this.positionChange(true);
              }
            });
          }
          if (this.position_changed && position === 0) {
            this.positionChange(false);
            this.spotifyService.updateCurrentTrackId();
          }
        }
      );
    };
  }

  positionChange(is_changed: boolean) {
    this.position_changed = is_changed;
  }

  logout() {
    let id = store.default.get('id');
    let browser_id = store.default.get('browser-id');

    const link = this.api_link + 'auth/logout?code=' + this.access_token;
    const headers = new HttpHeaders({
      'X-Spotify-UUID': id,
      'X-Browser-ID': browser_id,
    });

    store.default.remove('id');
    this.access_token = '';
    this.http.get<any>(link, { headers }).subscribe({
      next: (response) => {
        return;
      },
      error: (error) => {
        return;
      },
    });
  }

  pauseDevice() {
    this.player.pause().then(() => {
      this.positionChange(false);
    });
  }

  playDevice() {
    this.player.resume().then(() => {});
  }

  playOne(id: string) {
    this.spot_to_yt = true;
    this.spotifyService.playOne(id, this.access_token).subscribe({
      error: () => {
        this.token_expired = true;
        return true;
      },
    });
    return false;
  }

  refreshToken() {
    const browser_id = store.default.get('browser-id');
    const id = store.default.get('id');
    const link = this.api_link + 'auth/refresh?code=' + this.access_token;
    const headers = new HttpHeaders({
      'X-Spotify-UUID': id,
      'X-Browser-ID': browser_id,
    });
    this.token_refreshing = true;
    this.http.get<any>(link, { headers }).subscribe({
      next: (response) => {
        const access_token = response.token;
        if (access_token === null) {
          return;
        }
        this.access_token = access_token;
        this.token_expired = false;
        this.initializeSpotifyPlayer();

        this.token_refreshing = false;
        return;
      },
      error: (error) => {
        return;
      },
    });
  }

  updateVolume() {
    const computed_vol = this.spotify_volume / 100;
    this.player.setVolume(computed_vol);
    store.default.set('spot-volume', this.spotify_volume);
  }
}
