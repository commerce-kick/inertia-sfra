import { Link } from "@/components/link";
import { homeShow } from "@/generated/routes/home-show";

/** The bag with nothing in it — type as the whole composition. */
export function EmptyBag() {
  return (
    <div className="flex flex-col items-start gap-6 border-t py-20">
      <h2 className="display-caps text-4xl sm:text-5xl">Your bag is empty</h2>
      <Link href={homeShow({})} className="link-draw label-caps">
        Continue shopping
      </Link>
    </div>
  );
}
