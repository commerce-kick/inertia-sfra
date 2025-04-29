import Banner from "@/components/commerce/banner";
import Layout from "@/layouts/default";
import type { CartProps } from "@/types/cart";

const Cart = function ({ resources, items, numItems }: CartProps) {
  return (
    <div>
      <Banner title="Cart" />
      <div className="container mx-auto">
        {numItems === 0 ? (
          <p>{resources.emptyCartMsg}</p>
        ) : (
          <div>imtes list</div>
        )}
      </div>
    </div>
  );
};

//@ts-ignore
Cart.layout = (page) => <Layout>{page}</Layout>;

export default Cart;
