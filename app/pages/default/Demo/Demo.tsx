import { Demo_Show } from "@/generated/routes";
import isEmpty from "lodash/isEmpty";
import { CarrotIcon } from "lucide-react";

import { getUrl } from "@/generated/routes/_helpers";

export default function DemoPage(props: any) {
  return (
    <div>
      <CarrotIcon />
      {isEmpty("asd") ? "Not empty" : "Empty"} {getUrl(Demo_Show)}
    </div>
  );
}
