export type Wish = {
  id: string;
  title: string;
  note: string | null;
  image_url: string | null;
  shop_url: string | null;
  shop_name: string | null;
  price: string | null;
  is_priority: boolean;
  category: string | null;
  kind: "one_off" | "recurring";
  created_at: string;
};

export type Claim = {
  id: string;
  wish_id: string;
  claimer_id: string;
  claimer_name: string;
  status: "reserved" | "bought";
  reset_at: string | null;
};

export type Wishlist = {
  id: string;
  handle: string;
  personal_message: string;
  owner_id: string;
  owner_name: string;
};
