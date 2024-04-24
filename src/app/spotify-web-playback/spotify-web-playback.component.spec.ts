import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpotifyWebPlaybackComponent } from './spotify-web-playback.component';

describe('SpotifyWebPlaybackComponent', () => {
  let component: SpotifyWebPlaybackComponent;
  let fixture: ComponentFixture<SpotifyWebPlaybackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpotifyWebPlaybackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpotifyWebPlaybackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
