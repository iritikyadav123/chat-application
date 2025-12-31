import express, { Request, Response } from "express";
import {
  userSchema,
  siginInSchema,
  createRoomSchema,
} from "@repo/backend-common/type";
import { JWT_TOKEN } from "@repo/backend-common/config";
import jwt from "jsonwebtoken";
import { prisma } from "@repo/db/client";
import bcrypt from "bcrypt";
import { authMiddleware } from "./middleware";
const app = express();
app.use(express.json());

enum errorEndle {
  suceess = 200,
  inputError = 404,
  serverError = 501,
}

app.post("/signup", async (req: Request, res: Response) => {
  const dataParse = userSchema.safeParse(req.body);
  if (!dataParse.success) {
    return res.status(errorEndle.inputError).json({
      msg: "user input error",
      error: dataParse.error,
    });
  }
  const encryptedPassword = await bcrypt.hash(dataParse.data.password, 10);

  try {
    const user = await prisma.user.create({
      data: {
        username: dataParse.data.username,
        password: dataParse.data.password,
      },
    });

    if (!user) {
      return res.status(errorEndle.inputError).json({
        msg: "unable to signup login",
      });
    }

    const jsonToken = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_TOKEN
    );

    return res.status(errorEndle.suceess).json({
      msg: "user success full login",
      token: jsonToken,
    });
  } catch (err) {
    return res.status(errorEndle.serverError).json({
      msg: "server side error",
    });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  const dataParse = siginInSchema.safeParse(req.body);
  if (!dataParse.success) {
    return res.status(errorEndle.inputError).json({
      msg: "user input is incorrect",
      error: dataParse.error,
    });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        username: dataParse.data.username,
      },
    });
    if (!user) {
      return res.status(errorEndle.inputError).json({
        msg: "unauthorized user",
      });
    }

    const decodePassword = await bcrypt.compare(
      dataParse.data.password,
      user.password
    );
    if (!decodePassword) {
      return res.status(errorEndle.inputError).json({
        msg: "password is incorrect",
      });
    }

    const jsonToken = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_TOKEN
    );

    return res.status(errorEndle.suceess).json({
      msg: "user sign in successfully",
      token: jsonToken,
    });
  } catch (err) {
    return res.status(errorEndle.serverError).json({
      msg: "some server side error",
      error: err,
    });
  }
});

app.get("/getAlluser", authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = prisma.user.findMany({
      select: {
        username: true,
      },
    });

    if (!user) {
      return res.status(errorEndle.inputError).json({
        msg: "no user found",
      });
    }

    return res.status(errorEndle.suceess).json({
      users: user,
    });
  } catch (err) {
    return res.status(errorEndle.serverError).json({
      msg: "server side error",
    });
  }
});

app.post("/createRoom", authMiddleware, async (req: Request, res: Response) => {
  const dataParse = createRoomSchema.safeParse(req.body);
  const firstUser = req.username;
  if (!dataParse.success) {
    return res.status(errorEndle.inputError).json({
      msg: "user input is incorrect",
      error: dataParse.error,
    });
  }
  if (!firstUser) {
    return;
  }

  try {
    const otherUsername = dataParse.data.otherUsername;

    // prevent creating room with yourself
    if (firstUser === otherUsername) {
      return res.status(errorEndle.inputError).json({
        msg: "You cannot create a room with yourself",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          in: [firstUser, otherUsername],
        },
      },
      select: {
        id: true,
        username: true,
      },
    });

    // findMany returns array, so validate count
    if (users.length !== 2) {
      return res.status(errorEndle.inputError).json({
        msg: "Unable to find both users",
      });
    }

    // normalize pair order (UUID-safe)
    const [u1, u2] = users.sort((a: any, b: any) => a.id.localeCompare(b.id));
    if (!u1?.id || !u2?.id) {
      return;
    }
    const userAId = u1.id;
    const userBId = u2.id;

    // create OR return existing room
    const room = await prisma.room.upsert({
      where: {
        userAId_userBId: { userAId, userBId },
      },
      update: {},
      create: { userAId, userBId },
    });

    return res.status(200).json({
      msg: "Room ready",
      room,
    });
  } catch (err) {
    return res.status(500).json({ msg: "Internal server error" });
  }
});

app.post("/addChat", authMiddleware, async (req: Request, res: Response) => {
  const { roomId, message } = req.body;
  const senderId = req.userId || "";
  try {
    const chat = await prisma.chat.create({
      data: {
        roomId,
        message,
        senderId,
      },
    });

    if (!chat) {
      return res.status(errorEndle.inputError).json({
        msg: "unable to save the message",
      });
    }
  } catch (err) {
    return res.status(errorEndle.serverError).json({
      msg: "server side error",
    });
  }
});

app.listen(3007);
