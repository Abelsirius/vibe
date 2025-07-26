import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, inject, model, OnDestroy, OnInit, QueryList, signal, ViewChild, ViewChildren, ViewRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import {  MatInputModule } from '@angular/material/input';
import { MainService } from '../../../../../../core/main.service';
import { SharedCoreService } from '../../../../../../core/sharedCore.service';
import { GlobalService } from '../../../../../../core/global.service';
import { detailExpand, fade, fade2, viewportFade } from '../../../../../../animations';
import { MatDialog } from '@angular/material/dialog';
import { UploadComponent } from '../shared/upload/upload.component';
import { MatButtonModule } from '@angular/material/button';
import { Content } from '../../../home/interfaces/home.interface';

@Component({
  selector: 'app-post',
  imports: [
    CommonModule, 
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule

  ],
  templateUrl: './post.component.html',
  styleUrl: './post.component.scss',
  animations:[fade,fade2, viewportFade,detailExpand]
})
export class PostComponent implements OnInit, OnDestroy,AfterViewInit{
  imageUrl: string | null = null;
    public _globalService = inject(GlobalService);
        public _sharedCoreService = inject(SharedCoreService);
          public mainService = inject(MainService);
 commentsState = signal<Record<string, { show: boolean; comments: any[] }>>({});
  public _dialog = inject(MatDialog);
          public posts = model.required<any[]>();
  videoUrl: string | null = null;
  hashtags: string = '';
  public comentariosList = signal<Content[]>([]);
  posting: boolean = false;
  viewComment = signal<boolean>(false);
  readonly baseUrl: string = 'https://localhost:44317';
  isMuted = signal<boolean>(false);
  showVolumeSlider = signal<boolean>(false);
  private previousVolume = 0.5;

  toggleVolumeSlider(): void {
    this.showVolumeSlider.update(v => !v);
  }

setVolume(post: any, newVolume: number): void {
  newVolume = Math.max(0, Math.min(1, newVolume));
  post.volume = newVolume;
  post.isMuted = (newVolume === 0);
  
  // Aplica al elemento de video
  const videoElement = document.getElementById(`video-${post.id}`) as HTMLVideoElement;
  if (videoElement) {
    videoElement.volume = newVolume;
    videoElement.muted = post.isMuted;
  }
}

// Alternar mute/unmute para un post
toggleMute(post: any): void {
  if (post.isMuted) {
    this.setVolume(post, post.previousVolume || 0.7);
  } else {
    post.previousVolume = post.volume;
    this.setVolume(post, 0);
  }
}
@ViewChildren('videoPlayer') videoPlayers!: QueryList<ElementRef<HTMLVideoElement>>; // Reference to video elements
  private videoMap = new Map<string, HTMLVideoElement>();
  @ViewChildren('postElement') postElements!: QueryList<ElementRef<HTMLElement>>;
ngOnInit(): void {
  this.getMedias();
  }

ngAfterViewInit(): void {
    // Update videoMap when video elements change

    console.log(this.videoPlayers);
    this.videoPlayers.changes.subscribe(() => {
      this.updateVideoMap();
       
    });
      this.updateVideoMap();

  }
private updateVideoMap(): void {
    this.videoMap.clear();
    let videoIndex = 0; // Track index of video elements
    this.posts().forEach(post => {
      if (post.mediaType === 'video') {
        const videoRef = this.videoPlayers.toArray()[videoIndex];
        if (videoRef) {
          this.videoMap.set(post.id, videoRef.nativeElement);
          videoIndex++;
        }
      }
    });
  }
postCommnet(comentario:string,idMedio:number){
  this.mainService.postCommentario(comentario,this._globalService.idUser() as number,idMedio).subscribe({
    next:(res)=>{
      this.comentariosList.set(res.body);
      console.log("Comentarios List =>", this.comentariosList());
      this.getComentariosVideo(idMedio);
       this.posts.update((posts) =>
  posts.map((post) =>
    post.id === idMedio
      ? {
          ...post,
          comentario: '',
        }
      : post
  )
);
    }
  })
}

getComentariosVideo(id:number){
 this.mainService.getCommentario(id).subscribe({
    next: (e) => {
      this.commentsState.update(state => ({
        ...state,
        [id]: {
          ...state[id],
          comments: e.body
        }
      }));
    }
  });
}
play(id: number, event: Event) {
  const videoElement = (event.target)
    console.log(videoElement);
}

  toggleVideoPlay(postId: number, videoElement: HTMLVideoElement) {
    const post = this.posts().find(p => p.id === postId);
    if (!post) return;

    if (videoElement.paused) {
      videoElement.play();
      post.isPlaying = true;
    } else {
      videoElement.pause();
      post.isPlaying = false;
    }
  }

  showVideoControls(event: MouseEvent) {
    const videoElement = event.target as HTMLVideoElement;
    videoElement.controls = true;
  }

  hideVideoControls(event: MouseEvent) {
    const videoElement = event.target as HTMLVideoElement;
    videoElement.controls = false;
  }

toggleComments(postId: string): void {
  const currentState = this.commentsState();
  this.commentsState.set({
    ...currentState,
    [postId]: {
      show: !currentState[postId]?.show,
      comments: currentState[postId]?.comments || []
    }
  });

  if (!currentState[postId]?.comments?.length) {
    this.getComentariosVideo(Number(postId));
  }
  }
onVideoEnded(postId: string): void {
 this.posts.update(currentPosts => 
    currentPosts.map(post => 
      post.id === postId ? { ...post, isPlaying: false } : post
    )
  );
  }
getMedias(): void {
    this.mainService.getVideos().subscribe({
      next: (posts) => {
        this.posts.set(posts.body.map((post: { mediaType: any; url: string; }) => ({
          ...post,
          mediaType: post.mediaType || this.inferMediaType(post.url),
          comentario:'',
          comentarios:[],
       volume: 1,      // Añade esta propiedad (0-1)
  isMuted: false,     // Añade esta propiedad
  previousVolume: 0.5
        })));
      },
      error: (err) => {
        console.error('Failed to fetch media:', err);
      }
    });
  }
showControls(event: MouseEvent) {
  const video = event.target as HTMLVideoElement;
  video.controls = true;
}
@ViewChild('videoPlayer') videoPlayerRef!: ElementRef<HTMLVideoElement>;

playVideo() {
  this.videoPlayerRef.nativeElement.play();
}
pauseVideo() {
  this.videoPlayerRef.nativeElement.pause();
}
hideControls(event: MouseEvent) {
  const video = event.target as HTMLVideoElement;
  video.controls = false;
}
  private inferMediaType(url: string): 'video' | 'image' {
    const extension = url.toLowerCase().split('.').pop() || '';
    return ['mp4', 'mov', 'quicktime'].includes(extension) ? 'video' : 'image';
  }

   
  uploadPostDialog(){
   const dialogRef =  this._dialog.open(UploadComponent,{
      width:'',
      data:'',
        panelClass: 'custom-modalbox'
    })

    dialogRef.afterClosed().subscribe((e)=>{
      if(e){
        this.getMedias();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.videoUrl) {
      URL.revokeObjectURL(this.videoUrl);
    }
  }
}
