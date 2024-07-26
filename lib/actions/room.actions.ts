"use server";

import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";

import { liveblocks } from "../liveblocks";
import { parseStringify } from "../utils";

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();

  try {
    const metadata = { creatorId: userId, email, title: "Untitled" };
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses: { [email]: ["room:write"] },
      defaultAccesses: ["room:write"],
    });

    revalidatePath("/");

    return parseStringify<typeof room>(room);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error creating document: ${error}`);
  }
};

// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
export const getDocument = async ({ roomId, userId }: { roomId: string; userId: string }) => {
  try {
    const room = await liveblocks.getRoom(roomId);
    // TODO: Uncomment this when we have the user access control
    // const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    // if (!hasAccess) throw new Error("You don't have access to this document");

    return parseStringify<typeof room & { metadata: RoomMetadata }>(room);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error getting document: ${error}`);
  }
};

export const updateDocument = async (roomId: string, title: string) => {
  try {
    const updatedRoom = await liveblocks.updateRoom(roomId, { metadata: { title } });

    revalidatePath(`/documents/${roomId}`);

    return parseStringify<typeof updatedRoom>(updatedRoom);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error happened while updating a room: ${error}`);
  }
};

// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
export const getDocuments = async (email: string) => {
  try {
    const rooms = await liveblocks.getRooms({ userId: email });

    return parseStringify<typeof rooms>(rooms);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error getting rooms: ${error}`);
  }
};
