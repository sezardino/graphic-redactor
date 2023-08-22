"use client";

import { PlaygroundTemplate } from "@/components/templates/PlaygroundTemplate";
import { RedactorContext } from "@/machines/redactor";

const HomePage = () => {
  return (
    <RedactorContext.Provider>
      <PlaygroundTemplate />
    </RedactorContext.Provider>
  );
};

export default HomePage;
