import type React from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { toastNotification } from "@/components/utils"
import { Star } from "lucide-react"
import { useState } from "react"

interface Review {
  id: number
  userName: string
  userAvatar?: string
  rating: number
  date: string
  comment: string
  helpful: number
}

interface ReviewSectionProps {
  productId: number
  productName: string
}

export const ReviewSection = ({ productId, productName }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: 1,
      userName: "Sarah Johnson",
      userAvatar: "/placeholder.svg?height=40&width=40",
      rating: 3,
      date: "2023-12-15",
      comment:
        "This is exactly what I was looking for! The quality is excellent and it fits perfectly. I've already received several compliments when wearing it.",
      helpful: 12,
    },
    {
      id: 2,
      userName: "Michael Chen",
      userAvatar: "/placeholder.svg?height=40&width=40",
      rating: 2,
      date: "2023-11-28",
      comment:
        "Great product overall. The material is high quality and comfortable. I took off one star because the color is slightly different from what's shown in the pictures.",
      helpful: 8,
    },
    {
      id: 3,
      userName: "Jessica Williams",
      rating: 5,
      date: "2023-11-10",
      comment:
        "Absolutely love it! Fast shipping and the product exceeded my expectations. Will definitely buy from this seller again.",
      helpful: 5,
    },
  ])

  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRatingChange = (rating: number) => {
    setNewReview((prev) => ({ ...prev, rating }))
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
      // In a real app, you would send this to your API
      // const response = await fetch('/api/reviews', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     productId,
      //     rating: newReview.rating,
      //     comment: newReview.comment
      //   })
      // });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add the new review to the list
      const newReviewObj: Review = {
        id: reviews.length + 1,
        userName: "You", // In a real app, get the user's name from auth
        rating: newReview.rating,
        date: new Date().toISOString().split("T")[0],
        comment: newReview.comment,
        helpful: 0,
      }

      setReviews([newReviewObj, ...reviews])
      setNewReview({ rating: 0, comment: "" })
      toastNotification("Success", "Your review has been submitted")
    } catch (error) {
      console.error("Failed to submit review:", error)
      toastNotification("Error", "Failed to submit review. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleHelpfulClick = (reviewId: number) => {
    setReviews(reviews.map((review) => (review.id === reviewId ? { ...review, helpful: review.helpful + 1 } : review)))
  }

  // Calculate average rating
  const averageRating =
    reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-2">Customer Reviews</h2>

      <div className="flex items-center mb-6">
        <div className="flex items-center mr-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(averageRating) ? "fill-primary text-primary" : "fill-muted stroke-muted-foreground"
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
                  className={`w-6 h-6 ${
                    star <= newReview.rating ? "fill-primary text-primary" : "text-muted-foreground hover:text-primary"
                  }`}
                />
                <span className="sr-only">Rate {star} stars</span>
              </button>
            ))}
          </div>
        </div>
        <div className="mb-4">
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
              <Card key={review.id}>
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
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? "fill-primary text-primary"
                                  : "fill-muted stroke-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{review.date}</p>
                  </div>
                  <p className="mt-4">{review.comment}</p>
                  <div className="mt-4 flex items-center">
                    <Button variant="ghost" size="sm" onClick={() => handleHelpfulClick(review.id)}>
                      Was this helpful? ({review.helpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  )
}
