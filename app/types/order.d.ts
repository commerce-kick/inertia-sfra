export type TOrder = {
  orderNumber: string;
  priceTotal: string;
  creationDate: string;
  orderEmail: string;
  productQuantityTotal: number;
  firstLineItem?: {
    imageURL: string;
    alt: string;
    title: string;
  };
  shippedToFirstName: string;
  shippedToLastName: string;
  orderStatus?: any;
  resources: TOrderResource
};

export type TOrderResource = {
  items: string;
  item: string;
  [key: string]: string;
};

export interface OrderCardProps {
  order: TOrder;
  resources: TOrderResource;
}
