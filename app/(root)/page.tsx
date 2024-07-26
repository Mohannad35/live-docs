import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { redirect } from "next/navigation";
import Link from "next/link";

import AddDocumentBtn from "@/components/AddDocumentBtn";
import Header from "@/components/Header";
import { getDocuments } from "@/lib/actions/room.actions";
import { dateConverter } from "@/lib/utils";

const HomePage = async () => {
  const clerkUser = await currentUser();

  if (!clerkUser) redirect("/sign-in");
  const documents = await getDocuments(clerkUser.emailAddresses[0].emailAddress);

  return (
    <main className="home-container">
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          Notification
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>

      {documents && documents.data.length > 0 ? (
        <div className="document-list-container">
          <div className="document-list-title">
            <h3 className="text-28-semibold">All documents</h3>
            <AddDocumentBtn
              email={clerkUser.emailAddresses[0].emailAddress}
              userId={clerkUser.id}
            />
          </div>
          <ul className="document-ul">
            {documents.data.map(({ id, metadata, createdAt }) => (
              <li key={id} className="document-list-item">
                <Link className="flex flex-1 items-center gap-4" href={`/documents/${id}`}>
                  <div className="hidden rounded-md bg-dark-500 p-2 sm:block">
                    <Image alt="Document" height={40} src="/assets/icons/doc.svg" width={40} />
                  </div>
                  <div className="space-y-1">
                    <p className="line-clamp-1 text-lg">{metadata.title}</p>
                    <p className="text-sm font-light text-blue-100">
                      Created about {dateConverter(createdAt)}
                    </p>
                  </div>
                </Link>
                {/* TODO: Delete Button */}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="document-list-empty">
          <Image
            alt="Document"
            className="mx-auto"
            height={40}
            src="/assets/icons/doc.svg"
            width={40}
          />
          <AddDocumentBtn email={clerkUser.emailAddresses[0].emailAddress} userId={clerkUser.id} />
        </div>
      )}
    </main>
  );
};

export default HomePage;
