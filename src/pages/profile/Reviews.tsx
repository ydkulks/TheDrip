import { Card, CardContent } from "@/components/ui/card";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatDate, useTokenDetails } from "@/components/utils";
import { Star } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

interface Review {
  userId: number
  userName: string
  productId: number
  productName: string
  review_title: string
  rating: number
  updated: string
  review_text: string
}
interface ReviewResponse {
  content: Review[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface FetchReviewsParams {
  userId: number;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}
async function fetchReviews(params: FetchReviewsParams, token: string|null): Promise<ReviewResponse> {
  const { userId, sortBy, sortDirection, page, size } = params;

  // WARN: Backend URL
  let url = `http://localhost:8080/customer/review?userId=${userId}`;

  if (sortBy) {
    url += `&sortBy=${sortBy}`;
  }
  if (sortDirection) {
    url += `&sortDirection=${sortDirection}`;
  }
  if (page !== undefined) {
    url += `&page=${page}`;
  }
  if (size !== undefined) {
    url += `&size=${size}`;
  }

  // Remove trailing '&' or '?' if any
  url = url.replace(/&$/, '').replace(/\?$/, '');

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ReviewResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    throw error; // Re-throw the error to be handled by the caller.
  }
}
export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const { token, decodedToken } = useTokenDetails();
  useEffect(() => {
    async function getProductReviews() {
      try {
        const reviews = await fetchReviews({
          userId: decodedToken.id,
          page: page,
        },token);
        // console.log("Fetched reviews:", reviews);
        setReviews(reviews.content);
        setPage(reviews.number);
        setTotalPages(reviews.totalPages);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    }

    getProductReviews();
  }, [page])
  return (
    <div className="m-2">
      <h3 className="text-xl font-semibold mb-4">{decodedToken.sub}'s Reviews</h3>
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => (
            <Card key={review.userId+review.review_title}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-center">
                    <div>
                      <Link to={`/shop/view-product?productId=${review.productId}`} className="font-semibold hover:underline">{review.productName}</Link>
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${star <= review.rating
                              ? "fill-primary text-primary"
                              : "fill-muted stroke-muted-foreground"
                              }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatDate(review.updated)}</p>
                </div>
                <p className="mt-4 font-bold">{review.review_title}</p>
                <p className="mt-4">{review.review_text}</p>
              </CardContent>
            </Card>
          ))}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={() => setPage(Math.max(0, page - 1))}
                />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i).map((index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    href="#"
                    isActive={index === page}
                    onClick={() => setPage(index)}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      ) : (
        <p className="text-muted-foreground">No reviews yet!</p>
      )}
    </div>
  )
}

