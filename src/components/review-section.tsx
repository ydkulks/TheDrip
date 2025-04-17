import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { formatDate, toastNotification, token, tokenDetails } from "@/components/utils"
import { Star } from "lucide-react"
import { useEffect, useState } from "react"
import { Input } from "./ui/input"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "./ui/pagination"

interface Review {
  userId: number
  userName: string
  userAvatar?: string
  review_title: string
  rating: number
  updated: string
  review_text: string
  helpful: number
}

interface ReviewSectionProps {
  productId: number
  productName: string
}


interface ReviewResponse {
  content: Review[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}

interface FetchReviewsParams {
  productId: number;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  size?: number;
}

async function fetchReviews(params: FetchReviewsParams): Promise<ReviewResponse> {
  const { productId, sortBy, sortDirection, page, size } = params;

  let url = `http://localhost:8080/api/reviews/${productId}?`;

  if (sortBy) {
    url += `sortBy=${sortBy}&`;
  }
  if (sortDirection) {
    url += `sortDirection=${sortDirection}&`;
  }
  if (page !== undefined) {
    url += `page=${page}&`;
  }
  if (size !== undefined) {
    url += `size=${size}&`;
  }

  // Remove trailing '&' or '?' if any
  url = url.replace(/&$/, '').replace(/\?$/, '');

  try {
    const response = await fetch(url);

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

export const ReviewSection = ({ productId, productName }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  useEffect(() => {
    async function getProductReviews() {
      try {
        const reviews = await fetchReviews({
          productId: productId,
          page: page,
        });
        // console.log("Fetched reviews:", reviews);
        setReviews(reviews.content);
        setPage(reviews.number);
        setTotalPages(reviews.totalPages);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    }

    getProductReviews();
  }, [productId, page])

  const [newReview, setNewReview] = useState({
    title: "",
    rating: 0,
    comment: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }))
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewReview((prev) => ({ ...prev, title: e.target.value }))
  }

  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewReview((prev) => ({ ...prev, comment: e.target.value }))
  }

  const handleSubmitReview = async () => {
    if (newReview.rating === 0) {
      toastNotification("Error", "Please select a rating")
      return
    }

    if (newReview.comment.trim() === "") {
      toastNotification("Error", "Please write a review comment")
      return
    }

    setIsSubmitting(true)

    try {
      // WARN: Backend URL
      const response = await fetch('http://localhost:8080/customer/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // Include authorization header
        },
        body: JSON.stringify({
          userId: tokenDetails().id,
          product: productId,
          rating: newReview.rating,
          review_title: newReview.title,
          review_text: newReview.comment,
        })
      });
      if (!response.ok) {
        // Handle different HTTP status codes if needed
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // assert.strictEqual(response, )
      // const newReviewObj: Review = response as Review;

      // // Add the new review to the list
      const newReviewObj: Review = {
        userId: tokenDetails().id,
        userName: tokenDetails().sub, // In a real app, get the user's name from auth
        review_title: newReview.title,
        rating: newReview.rating,
        updated: new Date().toISOString().split("T")[0],
        review_text: newReview.comment,
        helpful: 0,
      }

      setReviews([newReviewObj, ...reviews])
      setNewReview({ title: "", rating: 0, comment: "" })
      toastNotification("Success", "Your review has been submitted")
    } catch (error) {
      console.error("Failed to submit review:", error)
      toastNotification("Error", "Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHelpfulClick = (reviewId: number) => {
    setReviews(reviews.map((review) => (review.userId === reviewId ? { ...review, helpful: review.helpful + 1 } : review)))
  }

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  // TODO: Paginate reviews
  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>

      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${star <= Math.round(averageRating) ? "fill-primary text-primary" : "fill-muted stroke-muted-foreground"
                }`}
            />
          ))}
        </div>
        <span className="font-semibold">{averageRating.toFixed(1)} out of 5</span>
        <span className="text-muted-foreground ml-2">({reviews.length} reviews)</span>
      </div>

      <Separator className="my-6" />

      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Write a Review</h3>
        <div className="mb-4">
          <p className="mb-2">Rating</p>
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => handleRatingChange(star)} className="mr-1">
                <Star
                  className={`w-6 h-6 ${star <= newReview.rating ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                />
                <span className="sr-only">Rate {star} stars</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
          <p className="mb-2">Review Title</p>
          <Input
            className="mb-2"
            value={newReview.title}
            onChange={handleTitleChange}
            placeholder="Review Title"
          />
          <p className="mb-2">Your Review</p>
          <Textarea
            placeholder={`What did you think about the ${productName}?`}
            rows={4}
            value={newReview.comment}
            onChange={handleCommentChange}
            className="resize-none"
          />
        </div>
        <Button onClick={handleSubmitReview} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>

      <Separator className="my-6" />

      <div>
        <h3 className="text-xl font-semibold mb-4">Customer Reviews ({reviews.length})</h3>
        {reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.userId}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                        <AvatarFallback>{review.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{review.userName}</p>
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
                  <div className="mt-4 flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => handleHelpfulClick(review.userId)}>
                      Was this helpful? ({review.helpful})
                    </Button>
                  </div>
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
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  )
}
