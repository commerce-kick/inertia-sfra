import { DemoShow } from "@/generated/routes";
import isEmpty from "lodash/isEmpty";
import { CarrotIcon } from "lucide-react";


export default function DemoPage() {
  return (
    <div>
      <CarrotIcon />
      {isEmpty("asd") ? "Not empty" : "Empty"} {DemoShow.url()}
    </div>
  );
}
