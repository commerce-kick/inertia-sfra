import { Link } from "@/components/link";
import { HomeDemo } from "@/generated/routes";

export default function HomeShowPage(props: unknown) {
  console.log(props);

  return (
    <h1>
      <Link href={HomeDemo.url()}>hola</Link>
    </h1>
  );
}
