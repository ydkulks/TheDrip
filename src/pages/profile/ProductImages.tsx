import { useSearchParams } from "react-router-dom"
import BulkUploadPage from "@/components/bulk-image-upload"
export default function ProductImages() {
  const [searchParams] = useSearchParams();
  const productIdParam = searchParams.get('productId');
  let productId: number[] = [];

  if (productIdParam) {
    // const parsedProductId = parseInt(productIdParam, 10);
    productId = productIdParam
      .split(",")
      .map(id => parseInt(id, 10))
      .filter(id => !isNaN(id));
  }

  return (
    <>
      {productId.length < 1 ? <p> Product ID Not found!</p> : null}
      {productId.length >= 1 ? <BulkUploadPage productIds={productId} /> : null}
    </>
  )
}

