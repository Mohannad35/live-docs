"use client";

import { useUser } from "@clerk/nextjs";
import { ClientSideSuspense, LiveblocksProvider } from "@liveblocks/react/suspense";
import { ReactNode } from "react";

import Loader from "@/components/Loader";
import { getClerkUsers, getDocumentUsers } from "@/lib/actions/user.actions";

const Provider = ({ children }: { children: ReactNode }) => {
  const { user: clerkUser } = useUser();

  return (
    <LiveblocksProvider
      authEndpoint="/api/liveblocks-auth"
      resolveMentionSuggestions={async ({ text, roomId }) => {
        const roomUsers = await getDocumentUsers({
          roomId,
          currentUser: clerkUser?.emailAddresses[0].emailAddress!,
          text,
        });

        return roomUsers;
      }}
      resolveUsers={async ({ userIds }) => await getClerkUsers({ userIds })}
    >
      <ClientSideSuspense fallback={<Loader />}>{children}</ClientSideSuspense>
    </LiveblocksProvider>
  );
};

export default Provider;
