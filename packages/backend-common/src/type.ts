import {z} from 'zod';

export const userSchema = z.object({
    username : z.string().min(2).max(100),
    password : z.string().min(2).max(150),
    name : z.string().min(2).max(150).optional()
})

export const siginInSchema =  z.object({
    username : z.string().min(2).max(100),
    password : z.string().min(2).max(150)
}) 

export const createRoomSchema = z.object({
    otherUsername : z.string().min(2).max(100)
})

