import { useState } from "react";
import "./FeedbackModal.css";

const MAX_CHARS = 300;

function saveFeedback(id, rating, comment) {
  try {
    const existing = JSON.parse(localStorage.getItem("candidate_feedback") || "[]");
    existing.push({
      id,
      rating,
      comment,
      date: new Date().toISOString().slice(0, 10),
    });
    localStorage.setItem("candidate_feedback", JSON.stringify(existing));
  } catch {
    // localStorage unavailable — proceed silently
  }
}

export default function FeedbackModal({ interviewId, onDone }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (rating > 0) {
      saveFeedback(interviewId, rating, comment.trim());
    }
    onDone();
  };

  const handleSkip = () => {
    onDone();
  };

  const activeStars = hovered || rating;

  return (
    <div className="fb-backdrop" aria-modal="true" role="dialog" aria-labelledby="fb-title">
      <div className="fb-card">
        <div className="fb-header">
          <span className="fb-eyebrow">Quick question</span>
          <h2 className="fb-title" id="fb-title">How was your experience with Priya?</h2>
          <p className="fb-subtitle">
            Your feedback helps us improve the interview for future candidates.
          </p>
        </div>

        <div
          className="fb-stars"
          role="radiogroup"
          aria-label="Rate your experience"
          onMouseLeave={() => setHovered(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              className={`fb-star ${n <= activeStars ? "fb-star-active" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHovered(n)}
            >
              <StarIcon filled={n <= activeStars} />
            </button>
          ))}
        </div>

        {rating > 0 && (
          <p className="fb-rating-label">{RATING_LABELS[rating]}</p>
        )}

        <div className="fb-textarea-wrap">
          <label className="fb-label" htmlFor="fb-comment">
            Anything else you'd like to share? <span className="fb-optional">(optional)</span>
          </label>
          <textarea
            id="fb-comment"
            className="fb-textarea"
            placeholder="Priya felt very natural to talk to…"
            maxLength={MAX_CHARS}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
          />
          <span className={`fb-char-count ${comment.length >= MAX_CHARS ? "fb-char-count-max" : ""}`}>
            {comment.length} / {MAX_CHARS}
          </span>
        </div>

        <div className="fb-actions">
          <button
            type="button"
            className="fb-btn-submit"
            onClick={handleSubmit}
            disabled={rating === 0}
          >
            Submit feedback
          </button>
          <button type="button" className="fb-btn-skip" onClick={handleSkip}>
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

const RATING_LABELS = {
  1: "Poor — something felt off",
  2: "Below average — a few issues",
  3: "OK — could be better",
  4: "Good — mostly smooth",
  5: "Excellent — felt very natural!",
};

function StarIcon({ filled }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="36"
      height="36"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}
