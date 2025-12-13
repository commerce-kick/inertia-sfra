import Banner from "@/components/commerce/banner";
import type { CartProps } from "@/types/cart";

const Cart = function ({ resources, numItems }: CartProps) {
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

export default Cart;
