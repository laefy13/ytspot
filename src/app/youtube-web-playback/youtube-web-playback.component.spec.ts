import { ComponentFixture, TestBed } from '@angular/core/testing';

import { YoutubeWebPlaybackComponent } from './youtube-web-playback.component';

describe('YoutubeWebPlaybackComponent', () => {
  let component: YoutubeWebPlaybackComponent;
  let fixture: ComponentFixture<YoutubeWebPlaybackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [YoutubeWebPlaybackComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(YoutubeWebPlaybackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
