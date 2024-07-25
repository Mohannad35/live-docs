import Image from "next/image";
import React from "react";

const Loader = () => {
  return (
    <div className="loader">
      <Image
        alt="loader"
        className="animate-spin"
        height={32}
        src="/assets/icons/loader.svg"
        width={32}
      />
      Loading...
    </div>
  );
};

export default Loader;
