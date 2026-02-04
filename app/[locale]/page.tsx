"use client";

import { Button } from "@heroui/react";
import Link from "next/link";

import { title, subtitle } from "@/components/primitives";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
      <div className="inline-block text-center justify-center">
        <span className={title()}>Choose a&nbsp;</span>
        <span className={title({ color: "violet" })}>beautiful&nbsp;</span>
        <br />
        <span className={title()}>
          website system regardless of your business model.
        </span>
      </div>

      <div className="mt-8 flex flex-row items-center justify-between gap-2">
        <span className={subtitle()}>Get started here</span>
        <Button as={Link} color="primary" href="/sign-in">
          Sign In
        </Button>
      </div>
    </section>
  );
}
