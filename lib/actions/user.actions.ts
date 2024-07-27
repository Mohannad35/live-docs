"use server";

import { clerkClient } from "@clerk/nextjs/server";

import { parseStringify } from "../utils";
import { liveblocks } from "../liveblocks";

export const getClerkUsers = async ({ userIds }: { userIds: string[] }) => {
  try {
    const clerk = clerkClient();
    const { totalCount, data } = await clerk.users.getUserList({ emailAddress: userIds });

    if (totalCount === 0) return [];
    const users = data.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      avatar: user.imageUrl,
    }));
    const sortedUsers = userIds.map((userId) => users.find((user) => user.email === userId));

    return parseStringify<User[]>(sortedUsers);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error(error);

    return [];
  }
};

type GetDocumentUsers = { roomId: string; currentUser: string; text: string };
export const getDocumentUsers = async ({ roomId, currentUser, text }: GetDocumentUsers) => {
  try {
    const room = await liveblocks.getRoom(roomId);

    const users = Object.keys(room.usersAccesses).filter((email) => email !== currentUser);

    if (text.length) {
      const lowerCaseText = text.toLowerCase();

      const filteredUsers = users.filter((email: string) =>
        email.toLowerCase().includes(lowerCaseText),
      );

      return parseStringify<string[]>(filteredUsers);
    }

    return parseStringify<string[]>(users);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(`Error fetching document users: ${error}`);

    return [];
  }
};
