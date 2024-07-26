"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { ClientSideSuspense, RoomProvider } from "@liveblocks/react/suspense";
import Image from "next/image";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Editor } from "@/components/Editor";
import Header from "@/components/Header";
import { updateDocument } from "@/lib/actions/room.actions";

import ActiveCollaborators from "./ActiveCollaborators";
import Loader from "./Loader";
import { Input } from "./ui/input";

const CollaborativeRoom = ({
  roomId,
  roomMetadata,
  currentUserType,
  users,
}: CollaborativeRoomProps) => {
  // const currentUserType = "editor";
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [documentTitle, setDocumentTitle] = useState(roomMetadata.title);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const updateTitle = useCallback(async () => {
    if (documentTitle === roomMetadata.title) return;
    setLoading(true);
    try {
      const updatedDocument = await updateDocument(roomId, documentTitle);

      if (updatedDocument) setEditing(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error updating title", error);
    }
    setLoading(false);
  }, [documentTitle, roomId, roomMetadata.title]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) updateTitle();
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [documentTitle, roomId, updateTitle]);

  const updateTitleHandler = async (e: React.KeyboardEvent) => {
    if (e.key !== "Enter") return;
    await updateTitle();
  };

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  return (
    <RoomProvider id={roomId}>
      <ClientSideSuspense fallback={<Loader />}>
        <div className="collaborative-room">
          <Header>
            <div ref={containerRef} className="justify flex w-fit items-center gap-2">
              {editing && !loading ? (
                <Input
                  ref={inputRef}
                  className="document-title-input"
                  disabled={!editing || loading}
                  placeholder="Enter title"
                  type="text"
                  value={documentTitle}
                  onChange={(e) => setDocumentTitle(e.target.value)}
                  onKeyDown={updateTitleHandler}
                />
              ) : (
                <>
                  <p className="document-title">{documentTitle}</p>
                </>
              )}

              {currentUserType === "editor" && !editing && (
                <Image
                  alt="edit"
                  className="cursor-pointer"
                  height={24}
                  src="/assets/icons/edit.svg"
                  width={24}
                  onClick={() => setEditing(true)}
                />
              )}

              {currentUserType !== "editor" && !editing && (
                <p className="view-only-tag">View only</p>
              )}

              {loading && <p className="text-sm text-gray-400">saving...</p>}
            </div>
            <div className="flex w-full flex-1 justify-end gap-2 sm:gap-3">
              <ActiveCollaborators />
              <SignedOut>
                <SignInButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          </Header>
          <Editor currentUserType={currentUserType} roomId={roomId} />
        </div>
      </ClientSideSuspense>
    </RoomProvider>
  );
};

export default CollaborativeRoom;
