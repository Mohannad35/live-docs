import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import CollaborativeRoom from "@/components/CollaborativeRoom";
import { getDocument } from "@/lib/actions/room.actions";
import { getClerkUsers } from "@/lib/actions/user.actions";

const DocumentPage = async ({ params: { id } }: SearchParamProps) => {
  const roomId = decodeURIComponent(id);
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");

  const room = await getDocument({ roomId, userId: clerkUser.emailAddresses[0].emailAddress });

  if (!room) redirect("/");

  const userIds = Object.keys(room.usersAccesses);
  const users = await getClerkUsers({ userIds });
  const usersData: User[] = users.map((user) => {
    return {
      ...user,
      userType: (room.usersAccesses[user.email] as string[])?.includes("room:write")
        ? "editor"
        : "viewer",
    };
  });

  const currentUserType = (
    room.usersAccesses[clerkUser.emailAddresses[0].emailAddress] as string[]
  )?.includes("room:write")
    ? "editor"
    : "viewer";

  return (
    <main className="flex w-full flex-col items-center">
      <CollaborativeRoom
        currentUserType={currentUserType}
        roomId={room.id}
        roomMetadata={room.metadata}
        users={usersData}
      />
    </main>
  );
};

export default DocumentPage;
