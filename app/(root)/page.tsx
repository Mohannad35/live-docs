import { SignedIn, UserButton } from "@clerk/nextjs";

import Header from "@/components/Header";

const HomePage = () => {
  return (
    <main className="home-container">
      <Header className="sticky left-0 top-0">
        <div className="flex items-center gap-2 lg:gap-4">
          Notification
          <SignedIn>
            <UserButton />
          </SignedIn>
        </div>
      </Header>
    </main>
  );
};

export default HomePage;
