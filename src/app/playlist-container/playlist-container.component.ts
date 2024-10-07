import {
  Component,
  ComponentRef,
  EventEmitter,
  Input,
  Output,
  ViewContainerRef,
} from '@angular/core';
import { PlaylistComponent } from '../playlist/playlist.component';
import * as store from 'store2';
import { v4 as uuidv4 } from 'uuid';

@Component({
  selector: 'app-playlist-container',
  standalone: true,
  imports: [PlaylistComponent],
  templateUrl: './playlist-container.component.html',
  styleUrl: './playlist-container.component.css',
})
export class PlaylistContainerComponent {
  @Input() youtubeCached: boolean = false;
  @Input() spotifyCached: boolean = false;
  @Input() getTime: boolean = false;
  @Input() urls: any;
  @Input() component_id: string = uuidv4();
  @Output() notifyParent: EventEmitter<any> = new EventEmitter();
  @Output() updateLoading: EventEmitter<any> = new EventEmitter();
  inherited_link = '';
  playlist_type = false;
  components: ComponentRef<PlaylistComponent>[] = [];

  constructor(private playlistContainer: ViewContainerRef) {}

  newPlaylist() {
    let component = this.playlistContainer.createComponent(PlaylistComponent);
    component.instance.youtubeCached = this.youtubeCached;
    component.instance.spotifyCached = this.spotifyCached;
    component.instance.getTime = this.getTime;
    component.instance.urls = this.urls;
    component.instance.component_id = this.component_id;
    component.instance.playlist_type = this.playlist_type;
    component.instance.inherited_link = this.inherited_link;
    component.instance.notifyParent.subscribe((eventData: any) => {
      this.updateParentPlaylist(eventData);
    });
    component.instance.updateLoading.subscribe((eventData: any) => {
      this.updateLoading.emit(eventData);
    });
    component.instance.deleteComponent.subscribe((eventData: any) => {
      this.removeComponent(eventData);
    });
    this.components.push(component);
    this.component_id = uuidv4();
  }

  loadPlaylists() {
    const playlists = store.default.get('playlists');
    if (playlists === null) return;
    Object.entries(playlists).forEach(([key, item]) => {
      const [playlist_num, inherited_link, playlist_type] = item as [
        number,
        string,
        boolean
      ];
      this.inherited_link = inherited_link;
      this.playlist_type = playlist_type;
      this.component_id = key;

      this.newPlaylist();
    });
  }

  updateParentPlaylist(eventData: string) {
    this.notifyParent.emit(eventData);
  }

  removeComponent(component_id: string) {
    const component = this.components.find(
      (component) => component.instance.component_id === component_id
    );
    if (!component) return;

    const viewIndex = this.playlistContainer.indexOf(component.hostView);

    if (viewIndex !== -1) {
      this.playlistContainer.remove(viewIndex);
      this.components.splice(this.components.indexOf(component), 1);
    }
  }

  ngOnInit(): void {
    this.loadPlaylists();
  }
}
