import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SpotifyService } from '../services/spotify.service';
import * as store from 'store2';
import { Inject, PLATFORM_ID } from '@angular/core';
import { LoadingComponent } from '../loading/loading.component';
import { environment } from '../../environments/environment';
import { FormsModule } from '@angular/forms';
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
  access_token: string | null = null;
  spotify_volume = 50;
  private position_changed = false;
  device_ready = false;
  spot_to_yt = false;
  token_expired = false;
  isBrowser: boolean;
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
    let id = store.default.get('id');
    let browser_id = store.default.get('browser-id');
    browser_id = browser_id === null ? 'a1' : browser_id; //randomstring.generate(255) : browser_id;
    store.default.set('browser-id', browser_id);
    this.login_link += browser_id;

    if (id === null) {
      if (this.isBrowser) {
        this.route.queryParams.subscribe(async (params) => {
          if ('id' in params) id = params['id'];
          else return;

          store.default.set('id', id);
          await this.getToken(id, browser_id);
        });
      } else {
      }
    } else {
      await this.getToken(id, browser_id);
    }
  }

  private async getToken(id: any, browser_id: any): Promise<void> {
    // id = store.default.get('id');
    if (id === null) return;
    const link = this.api_link + 'token';
    const headers = new HttpHeaders({
      'X-Spotify-UUID': id,
      'X-Browser-ID': browser_id,
    });
    this.http.get<any>(link, { headers }).subscribe({
      next: (response) => {
        const access_token = response.token;
        if (access_token === null) {
          return null;
        }
        this.access_token = access_token;
        store.default.set('access_token', access_token);

        this.router.navigate([], {
          queryParams: {
            id: null,
          },
          queryParamsHandling: 'merge',
        });
        this.initializeSpotifyPlayer();
        return;
      },
      error: (error) => {
        this.logout();
        return;
      },
    });
  }
  private initializeSpotifyPlayer() {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      this.player = new window.Spotify.Player({
        name: 'Web Playback SDK',
        getOAuthToken: (cb: (arg0: any) => void) => {
          cb(this.access_token);
        },
        volume: 1,
      });

      this.player.addListener('ready', ({ device_id }: any) => {
        store.default.set('device_id', device_id);
      });

      // this.player.addListener('not_ready', ({ device_id }: any) => {
      //   console.log('Device ID has gone offline', device_id);
      // });

      this.player.connect().then((success: any) => {
        if (success) {
          this.device_ready = true;
          const temp_vol = store.default.get('spot-volume');
          this.spotify_volume = temp_vol ? temp_vol : this.spotify_volume;
          this.updateVolume();
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
    store.default.remove('access_token');
    store.default.remove('id');
    store.default.remove('browser-id');
    this.access_token = null;
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
    this.spotifyService.playOne(id).subscribe({
      error: () => {
        // ask if user wants to refresh token and play it
        // or if autorefresh then do it auto
        this.token_expired = true;
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
    this.http.get<any>(link, { headers }).subscribe({
      next: (response) => {
        const access_token = response.token;
        if (access_token === null) {
          return null;
        }
        this.access_token = access_token;
        store.default.set('access_token', access_token);
        this.token_expired = false;
        this.initializeSpotifyPlayer();
        return;
      },
      error: (error) => {
        this.logout();
        return;
      },
    });
  }

  private getIdFromUri(uri: string): string {
    const type = uri.includes('/playlist')
      ? 'playlist'
      : uri.includes('/track')
      ? 'track'
      : 'album';
    const regex = new RegExp(`\/${type}\/([a-zA-Z0-9]+)`);
    const match = uri.match(regex);
    if (match && match.length >= 2) {
      return match[1];
    }
    return '';
  }
  updateVolume() {
    const computed_vol = this.spotify_volume / 100;
    this.player.setVolume(computed_vol);
    store.default.set('spot-volume', this.spotify_volume);
  }
}
