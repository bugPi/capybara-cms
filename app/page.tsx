import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 dark:bg-black">
      <Image
        className="dark:invert"
        src="/capybara.svg"
        alt="Capybara CMS logo"
        width={120}
        height={120}
        priority
      />
    </div>
  );
}