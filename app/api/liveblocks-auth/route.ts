import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { liveblocks } from "@/lib/liveblocks";
import { getUserColor } from "@/lib/utils";

// eslint-disable-next-line no-unused-vars, unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
export async function POST(request: Request) {
  // Get the current user from your database
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");
  const { id, firstName, lastName, emailAddresses, imageUrl } = clerkUser;
  const user = {
    id,
    info: {
      id,
      name: `${firstName} ${lastName}`,
      email: emailAddresses[0].emailAddress,
      avatar: imageUrl,
      color: getUserColor(id),
    },
  };

  // Start an auth session inside your endpoint
  const session = liveblocks.prepareSession(user.id, { userInfo: user.info });

  // Use a naming pattern to allow access to rooms with wildcards
  // Giving the user read access on their org, and write access on their group
  // session.allow(`${user.organization}:*`, session.READ_ACCESS);
  // session.allow(`${user.organization}:${user.group}:*`, session.FULL_ACCESS);

  // Authorize the user and return the result
  const { status, body } = await session.authorize();

  return new Response(body, { status });
}
