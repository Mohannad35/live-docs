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
      defaultAccesses: [],
    });

    revalidatePath("/");

    return parseStringify(room);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error creating document: ${error}`);
  }
};
