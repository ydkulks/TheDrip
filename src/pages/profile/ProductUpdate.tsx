import { ProductUpdater } from "@/components/product-updater";
import { jwtDecode } from "jwt-decode";
import { useSearchParams } from "react-router-dom"

interface tokenType {
  email: string
  exp: number
  iat: number
  id: number
  role: string
  sub: string
}

export default function ProductUpdate() {
  const token = localStorage.getItem("token")
  let decodedToken: tokenType | null = null
  const [searchParams] = useSearchParams();
  const productIdParam = searchParams.get('productId');
  let productId: number[] = [];

  if (productIdParam) {
    productId = productIdParam
      .split(",")
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
    // console.log(productIdParam, productId);
  }

  if (token) {
    decodedToken = jwtDecode<tokenType>(token)
  }
  return (
    <div>
      <ProductUpdater productId={productId}/>
    </div>
  )
}

