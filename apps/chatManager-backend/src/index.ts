import { createClient } from 'redis';
import type { RedisClientType } from 'redis';
import {prisma} from '@repo/db/client'


const REDIS_URL = 'redis://localhost:6379';

export const redisClient: any = createClient({
  url: REDIS_URL,
});

redisClient.on('error', (err: Error) => {
  console.error('Redis Client Error:', err);
});


export const connectRedis = async (): Promise<RedisClientType> => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log('Redis connected');
  }
  return redisClient;
};

async function dataSubmission(submission: string) {
    if(!submission) {
        return ;
    }
    const {roomId, message, userId} = JSON.parse(submission);
    await prisma.chat.create({
        data : {
            roomId,
            message,
            senderId: userId
        }
    })
}

async function startWorker() {
    try {
        await connectRedis()
        console.log('worker connected to redis');


        while(true) {
            try {
                const submission = await redisClient.brPop('iritikyadav123',1);
                await dataSubmission(submission.element)


            }catch(err) {
                console.log(err)
            }
        }
    }catch(err) {
        console.log(err)
    }
}

startWorker()
