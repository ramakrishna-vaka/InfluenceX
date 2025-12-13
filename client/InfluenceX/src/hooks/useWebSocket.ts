import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

interface Notification {
  id: number;
  notification: string;
  readBy: boolean;
}

export const useWebSocket = (userId: number | undefined) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (!userId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      debug: (str) => {
        console.log('STOMP: ' + str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

      client.onConnect = () => {
          console.log('WebSocket Connected');

          // Subscribe to user-specific notifications
        //   client.subscribe(`/user/queue/notifications`, (message) => {
        //       const notification = JSON.parse(message.body);
        //       console.log('Received notification:', notification);
        //       setNotifications(prev => [notification, ...prev]);
          //   });
          
          client.subscribe(`/topic/notifications/${userId}`, (message) => {
                const notification = JSON.parse(message.body);
                console.log("Received:", notification);
                setNotifications(prev => [notification, ...prev]);
            });

      };


    client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, [userId]);

  return { notifications, setNotifications };
};