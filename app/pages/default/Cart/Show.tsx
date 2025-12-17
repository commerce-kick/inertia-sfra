import Banner from "@/components/commerce/banner";

const Cart = function ({ resources, numItems }: any) {
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
