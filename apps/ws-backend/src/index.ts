import { WebSocketServer, WebSocket } from 'ws';
import jwt from 'jsonwebtoken'
import {JWT_TOKEN} from '@repo/backend-common/config'
import { createClient } from 'redis';
import type { RedisClientType } from 'redis';

const REDIS_URL = 'redis://localhost:6379';

export const redisClient: any = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err: Error) => {
  console.error('Redis Client Error:', err);
});


const wss = new WebSocketServer({port: 8088});

const userSockets = new Map<string, WebSocket>();


const checkUser=(token:string): string | null => {
    try {
        const decode = jwt.verify(token ,JWT_TOKEN)
        
        if(typeof decode == "string") {
            return null;
        }

        if(!decode || !decode.userId) {
            return null
        }

        return decode.userId

    }catch(e) {
        return null
    }
}

async function broadcastToRoom(roomId: string, payload: any) {
  const users = await redisClient.sMembers(`room:${roomId}:users`);

  for (const userId of users) {
    const ws = userSockets.get(userId);
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(payload));
    }
  }
}

wss.on('connection', function connection(ws,request) {
  ws.on('error', console.error);

  const url = request.url
  if(!url) {
    return
  }
  const querParams = new URLSearchParams(url.split("?")[1]);
  const token = querParams.get('token') || "";
  const userId : string | null = checkUser(token);

  if(userId == null) {
    ws.close();
    return;
  }

  userSockets.set(userId, ws);
  ws.on('message', async function message(data) {
    const parseData = JSON.parse(data as unknown as string);

     if(parseData.type == "join the room") {
        await redisClient.sAdd(`room:${parseData.roomId}:users`, userId);

         console.log(`User ${userId} joined room ${parseData.roomId}`);
        
     }else if(parseData.type == 'leave the room') {
        await redisClient.sRem(`room:${parseData.roomId}:users`, userId);
     }else if(parseData.type == 'chat') {
         await broadcastToRoom(parseData.roomId, {
          type: "chat",
          roomId : parseData.roomId,
          message : parseData.message,
          userId,
        });
     }
  });

});