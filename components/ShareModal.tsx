"use client";

import { useSelf } from "@liveblocks/react/suspense";
import Image from "next/image";
import { useState } from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { updateDocumentAccess } from "@/lib/actions/room.actions";

import Collaborator from "./Collaborator";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import UserTypeSelector from "./UserTypeSelector";

const ShareModal = ({
  roomId,
  collaborators,
  creatorId,
  currentUserType,
}: ShareDocumentDialogProps) => {
  const user = useSelf();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [userType, setUserType] = useState<UserType>("viewer");
  const [errorMessage, setErrorMessage] = useState<string>();

  const shareDocumentHandler = async () => {
    setLoading(true);

    const { error } = await updateDocumentAccess({
      roomId,
      email,
      userType: userType as UserType,
      updatedBy: user.info,
    });

    if (error) {
      setErrorMessage(error);
      setTimeout(() => setErrorMessage(undefined), 5000);
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button
          className="gradient-blue flex h-9 gap-1 px-4"
          disabled={!["editor", "creator"].includes(currentUserType)}
        >
          <Image
            alt="share"
            className="min-w-4 md:size-5"
            height={20}
            src="/assets/icons/share.svg"
            width={20}
          />
          <p className="mr-1 hidden sm:block">Share</p>
        </Button>
      </DialogTrigger>
      <DialogContent className="shad-dialog">
        <DialogHeader>
          <DialogTitle>Manage who can view this project</DialogTitle>
          <DialogDescription>Select which users can view and edit this document</DialogDescription>
        </DialogHeader>

        <Label className="mt-6 text-blue-100" htmlFor="email">
          Email address
        </Label>
        <div className="flex items-center gap-3">
          <div className="flex flex-1 rounded-md bg-dark-400">
            <Input
              className="share-input"
              id="email"
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <UserTypeSelector setUserType={setUserType} userType={userType} />
          </div>
          <Button
            className="gradient-blue flex h-full gap-1 px-5"
            disabled={loading}
            type="submit"
            onClick={shareDocumentHandler}
          >
            {loading ? "Sending..." : "Invite"}
          </Button>
        </div>

        {errorMessage && <p className="text-sm text-red-500">{errorMessage}</p>}

        <div className="my-2 space-y-2">
          <ul className="flex flex-col">
            {collaborators.map((collaborator) => (
              <Collaborator
                key={collaborator.id}
                collaborator={collaborator}
                creatorId={creatorId}
                email={collaborator.email}
                roomId={roomId}
                user={user.info}
              />
            ))}
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
