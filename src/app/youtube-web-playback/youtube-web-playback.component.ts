import { Component } from '@angular/core';
import { YtserviceService } from '../services/ytservice.service';

@Component({
  selector: 'app-youtube-web-playback',
  standalone: true,
  imports: [],
  templateUrl: './youtube-web-playback.component.html',
  styleUrl: './youtube-web-playback.component.css',
})
export class YoutubeWebPlaybackComponent {
  player: any;
  youtube_loop: boolean = false;
  youtube_shuffle: boolean = false;

  constructor(private ytService: YtserviceService) {}
  pauseVideo() {
    try {
      this.player.pauseVideo();
    } catch {
      console.log('cannot pause vid');
    }
  }
  playVideo() {
    try {
      this.player.playVideo();
    } catch {
      console.log('cannot play vid');
    }
  }

  playOne(track_uri: string) {
    this.player.loadVideoById(track_uri, 0);
  }
  stopVideo() {
    this.player.stopVideo();
  }
  ngOnInit(): void {
    this.ytService.loadPlayer().subscribe(
      (player: any) => {
        this.player = player;
      },
      () => {
        console.error('Error loading YouTube player:');
      }
    );
  }
  updateClasses(player_type: number, playerState: number) {
    const iFrame = this.player.getIframe();
    switch (player_type) {
      case 1: {
        const classes = ['h-50'];
        if (playerState !== 0) classes.push('animate-fadeOut');
        iFrame.classList.add(...classes);
        iFrame.classList.remove('animate-fadeIn', 'h-30vh');
        return false;
        break;
      }
      default: {
        iFrame.classList.add('animate-fadeIn', 'h-30vh');
        iFrame.classList.remove('animate-fadeOut', 'h-50');
        return true;
      }
    }
  }
}
