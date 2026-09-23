import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private serverUrl = 'http://localhost:5000'; // Backend server URL

  constructor() {
    // Socket connection initialize karein
    this.socket = io(this.serverUrl, {
      autoConnect: true
    });
  }

  // Connection establish hone par ya kisi room ko join karne ke liye
  joinRoom(roomName: string): void {
    this.socket.emit('join_room', roomName);
  }

  // Backend se aane wale live events ko listen karne ke liye (Generic type T use kiya gaya hai)
  onEvent<T>(eventName: string): Observable<T> {
    return new Observable<T>((observer) => {
      this.socket.on(eventName, (data: T) => {
        observer.next(data);
      });

      // Cleanup function jab observable unsubscribe ho jaye
      return () => {
        this.socket.off(eventName);
      };
    });
  }

  // Disconnect handler
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }
}