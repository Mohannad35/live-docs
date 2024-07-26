"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import { createDocument } from "@/lib/actions/room.actions";

import { Button } from "./ui/button";

const AddDocumentBtn = ({ userId, email }: AddDocumentBtnProps) => {
  const router = useRouter();
  const addDocumentHandler = async () => {
    try {
      const room = await createDocument({ userId, email });

      if (room) router.push(`/documents/${room.id}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  return (
    <Button
      className="gradient-blue flex gap-1 shadow-md"
      type="submit"
      onClick={addDocumentHandler}
    >
      <Image alt="Add document" height={24} src="/assets/icons/add.svg" width={24} />
      <p className="hidden sm:block">Start a blank document</p>
    </Button>
  );
};

export default AddDocumentBtn;
