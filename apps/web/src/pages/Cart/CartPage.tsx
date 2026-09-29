import { useParams } from "react-router-dom";
import { CartDetail } from "./components/CartDetail.tsx";
import { CartList } from "./components/CartList.tsx";

export function CartPage() {
  const { id } = useParams();
  return id ? <CartDetail id={id} /> : <CartList />;
}
