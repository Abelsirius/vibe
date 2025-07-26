import { AfterViewChecked, Component, DestroyRef, ElementRef, Inject, inject, OnInit, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ChatService, Message } from '../../../../../../../core/shared/chat.service';
import { Router } from '@angular/router';
import { GlobalService } from '../../../../../../../core/global.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserProfile } from '../../../../home/interfaces/home.interface';
interface ChatData {
  roomId: number;
  recipientName: string;
  lastSeen: string;
}
@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [MatIconModule, MatInputModule, MatButtonModule,FormsModule,CommonModule],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit,AfterViewChecked  {

  @ViewChild('messagesContainer') private chatBox!:ElementRef
  public messageInput = '';
  public messages = signal<Message[]>([]);
  public currentUserId: number;
  public isLoading = signal(true);
  public error = signal<string | null>(null);
  private scrollEnabled = true;
  private destroyRef = inject(DestroyRef);

  constructor(
    public dialogRef: MatDialogRef<ChatComponent>,
    public chatService: ChatService,
    public globalService: GlobalService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public otherPerfil: UserProfile
  ) {
    this.currentUserId = this.globalService.idUser() as number;
  }
  
    ngAfterViewChecked(): void {
    if (this.scrollEnabled) {
      this.scrollToBottom();
    }
  }

  async ngOnInit(): Promise<void> {
    try {
      await this.initializeChat();
    } catch (err) {
      this.handleError(err);
    } finally {
      this.isLoading.set(false);
    }
  }
  onScroll(): void {
    const container = this.chatBox.nativeElement;
    const isNearBottom = 
      container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
    this.scrollEnabled = isNearBottom;
  }
  private async initializeChat(): Promise<void> {
    // Iniciar conexión y unirse al chat
    await this.chatService.startConnection();
    await this.chatService.getOrCreatePrivateChat(this.otherPerfil.id);
    
    // Cargar historial inicial
    await this.chatService.loadChatHistory(
      this.chatService.currentRoom() ? parseInt(this.chatService.currentRoom()!) : 0
    );
  }

  public async sendMessage(): Promise<void> {
    if (!this.messageInput.trim()) return;

    this.isLoading.set(true);
    this.error.set(null);

    try {
      await this.chatService.sendMessage(this.messageInput);
      this.messageInput = '';
    } catch (err) {
      this.handleError(err);
    } finally {
      setTimeout(() => this.scrollToBottom(), 100);
      this.isLoading.set(false);
    }
  }
  scrollToBottom(): void {
  setTimeout(() => {
    const container = this.chatBox.nativeElement;
    container.scrollTop = container.scrollHeight;
  }, 0);
  }

    onContentUpdated(): void {
    this.scrollToBottom();
  }
  public closeChat(): void {
    this.dialogRef.close();
    // Opcional: limpiar mensajes al cerrar
    this.messages.set([]);
  }

  private handleError(error: any): void {
    console.error('Chat error:', error);
    this.error.set(error.message || 'Error en el chat');
    
    // Opcional: redirigir si el error es de autenticación
    if (error.status === 401) {
      this.router.navigate(['/login']);
    }
  }

  // Helper para determinar si el mensaje es del usuario actual
  public isCurrentUser(senderId: number): boolean {
    return senderId === this.currentUserId;
  }
}