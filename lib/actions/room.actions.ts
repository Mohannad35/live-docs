"use server";

import { RoomData } from "@liveblocks/node";
import { nanoid } from "nanoid";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { liveblocks } from "../liveblocks";
import { getAccessType, parseStringify } from "../utils";

import { getClerkUsers } from "./user.actions";

export const createDocument = async ({ userId, email }: CreateDocumentParams) => {
  const roomId = nanoid();
  const metadata = { creatorId: userId, email, title: "Untitled" };

  try {
    const room = await liveblocks.createRoom(roomId, {
      metadata,
      usersAccesses: { [email]: ["room:write"] },
      defaultAccesses: [],
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
    const hasAccess = Object.keys(room.usersAccesses).includes(userId);

    if (!hasAccess) throw new Error("You don't have access to this document");

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

export const updateDocumentAccess = async ({
  roomId,
  email,
  userType,
  updatedBy,
}: ShareDocumentParams): Promise<{ room?: RoomData; error?: string }> => {
  const user = await getClerkUsers({ userIds: [email] });

  if (!user || user.length < 1) return { error: "Email not found. Ask him to register" };
  try {
    const usersAccesses: RoomAccesses = { [email]: getAccessType(userType) as AccessType };
    const room = await liveblocks.updateRoom(roomId, { usersAccesses });

    if (room) {
      const notificationId = nanoid();

      await liveblocks.triggerInboxNotification({
        userId: email,
        kind: "$documentAccess",
        subjectId: notificationId,
        activityData: {
          userType,
          title: `You have been granted ${userType} access to the document by ${updatedBy.name}`,
          updatedBy: updatedBy.name,
          avatar: updatedBy.avatar,
          email: updatedBy.email,
        },
        roomId,
      });
    }

    revalidatePath(`/documents/${roomId}`);

    return { room: parseStringify<typeof room>(room) };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error happened while updating a room access: ${error}`);

    return { error: "Error updating room access" };
  }
};

export const removeCollaborator = async ({ roomId, email }: { roomId: string; email: string }) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    if (room.metadata.email === email)
      throw new Error("You cannot remove yourself from the document");

    const updatedRoom = await liveblocks.updateRoom(roomId, { usersAccesses: { [email]: null } });

    revalidatePath(`/documents/${roomId}`);

    return parseStringify(updatedRoom);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error happened while removing a collaborator: ${error}`);
  }
};

export const deleteDocument = async (roomId: string) => {
  try {
    await liveblocks.deleteRoom(roomId);
    revalidatePath("/");
    redirect("/");
  } catch (error: any) {
    if (error.message !== "NEXT_REDIRECT")
      // eslint-disable-next-line no-console
      console.log(`Error happened while deleting a room: ${error}`);
  }
};
