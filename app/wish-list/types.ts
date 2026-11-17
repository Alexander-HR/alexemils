export type Wish = {
  id: string;
  title: string;
  note: string | null;
  image_url: string | null;
  shop_url: string | null;
  price: string | null;
  is_priority: boolean;
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
