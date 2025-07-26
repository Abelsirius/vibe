import { Injectable, signal } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { AuthService } from '../auth.service';
import { GlobalService } from '../global.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
interface ChatRoom {
  id: number;
  name: string;
  participants: Participant[];
}

interface Participant {
  userId: number;
  userName: string;
}

export interface Message {
  id: number;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: Date;
  isRead: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubUrl = 'https://vibeapi.somee.com';
  private hubConnection!: signalR.HubConnection;
  
  // Signals para estado reactivo
  public currentRoom = signal<string | null>(null);
  public messages = signal<Message[]>([]);
  public messages$ = toObservable(this.messages);
  public chatRooms = signal<ChatRoom[]>([]);
  public connectionState = signal<'disconnected' | 'connecting' | 'connected'>('disconnected');

  constructor(
    private authService: AuthService,
    private globalService: GlobalService
  ) { }

  // 🔌 Iniciar conexión con SignalR
  public async startConnection() {
    this.connectionState.set('connecting');
    
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.hubUrl+ '/chatHub', {
        accessTokenFactory: () => this.authService.getToken(),
        withCredentials: true
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Configurar handlers
    this.setupSignalREvents();

    try {
      await this.hubConnection.start();
      this.connectionState.set('connected');
      console.log('✅ Conectado al servidor de chat');
      
      // Cargar chats del usuario al conectar
      await this.loadUserChats();
    } catch (err) {
      this.connectionState.set('disconnected');
      console.error('❌ Error al conectar al hub:', err);
      throw err;
    }
  }

  // 🏗️ Configurar eventos de SignalR
  private setupSignalREvents() {
    this.hubConnection.on("ReceiveMessage", (msg: Message) => {
      this.messages.update(old => [...old, msg]);
      // Opcional: Marcar como entregado
       console.log(this.messages());
      this.markAsDelivered(msg.id);
    });

    this.hubConnection.on("ChatRoomCreated", (room: ChatRoom) => {
      this.chatRooms.update(rooms => [...rooms, room]);
    });

    this.hubConnection.onclose(() => {
      this.connectionState.set('disconnected');
    });

    this.hubConnection.onreconnecting(() => {
      this.connectionState.set('connecting');
    });

    this.hubConnection.onreconnected(() => {
      this.connectionState.set('connected');
    });
  }

  // 💬 Obtener o crear chat privado
  public async getOrCreatePrivateChat(otherUserId: number): Promise<ChatRoom> {
    try {
      const room = await this.hubConnection.invoke<ChatRoom>(
        "GetOrCreatePrivateChat", 
        otherUserId
      );
      
      this.currentRoom.set(room.id.toString());
      await this.joinChatRoom(room.id);
      await this.loadChatHistory(room.id);
      
      return room;
    } catch (err) {
      console.error('❌ Error al obtener/crear chat:', err);
      throw err;
    }
  }

  // ✉️ Enviar mensaje
  public async sendMessage(content: string): Promise<void> {
    const currentRoomId = this.currentRoom();
    if (!currentRoomId) {
      throw new Error('No hay sala seleccionada');
    }

    try {
     const messageDto = await this.hubConnection.invoke(
        'SendMessage', 
        parseInt(currentRoomId), 
        content
      )
       console.log(messageDto);
    } catch (err) {
      console.error('❌ Error al enviar mensaje:', err);
      throw err;
    }
    
  }

  // 📜 Cargar historial de chat
  public async loadChatHistory(roomId: number, page: number = 1): Promise<void> {
    try {
      const messages = await this.hubConnection.invoke<Message[]>(
        'GetHistory', 
        roomId, 
        page
      );
      
      this.messages.set(messages.reverse()); // Mostrar los más antiguos primero
    } catch (err) {
      console.error('❌ Error al cargar historial:', err);
      throw err;
    }
  }

  // 👥 Cargar chats del usuario
  public async loadUserChats(): Promise<void> {
    try {
      const rooms = await this.hubConnection.invoke<ChatRoom[]>('GetUserChats');
      this.chatRooms.set(rooms);
    } catch (err) {
      console.error('❌ Error al cargar chats del usuario:', err);
      throw err;
    }
  }

  // 🔍 Unirse a sala de chat
  private async joinChatRoom(roomId: number): Promise<void> {
    await this.hubConnection.send('JoinChatRoom', roomId);
  }

  // ✅ Marcar mensajes como leídos
  public async markMessagesAsRead(roomId: number): Promise<void> {
    try {
      await this.hubConnection.invoke('MarkMessagesAsRead', roomId);
    } catch (err) {
      console.error('❌ Error al marcar mensajes como leídos:', err);
    }
  }

  // 📩 Marcar mensaje como entregado (opcional)
  private async markAsDelivered(messageId: number): Promise<void> {
    try {
      await this.hubConnection.send('MarkAsDelivered', messageId);
    } catch (err) {
      console.error('❌ Error al marcar como entregado:', err);
    }
  }

  // 🚪 Desconectar
  public async disconnect() {
    if (this.hubConnection) {
      await this.hubConnection.stop();
      this.connectionState.set('disconnected');
    }
  }
}