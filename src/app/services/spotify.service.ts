import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';
import * as store from 'store2';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private apiUrl = 'https://api.spotify.com/v1';
  private currentPlayerTrackId = new Subject<void>();

  constructor(private http: HttpClient) {}

  currentPlayerTrackId$ = this.currentPlayerTrackId.asObservable();

  updateCurrentTrackId() {
    this.currentPlayerTrackId.next();
  }

  playOne(track_uri: string, access_token: string): Observable<any> {
    const [device_id, headers] = this.getVar(access_token);
    const body = {
      uris: [`spotify:track:${track_uri}`],
      position_ms: 0,
    };
    return this.http.put<any>(
      `${this.apiUrl}/me/player/play?device_id=${device_id}`,
      body,
      {
        headers,
      }
    );
  }

  private getVar(access_token: string) {
    const device_id = store.default.get('device_id');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${access_token}`,
    });
    return [device_id, headers];
  }
}
