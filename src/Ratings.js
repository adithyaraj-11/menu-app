import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './Ratings.css';

const MEAL_TIMES = {
  breakfast: [7 * 60 + 15, 9 * 60 + 45],
  lunch: [11 * 60 + 45, 15 * 60 + 30],
  snacks: [17 * 60 + 30, 19 * 60 + 30],
  dinner: [19 * 60 + 15, 21 * 60 + 45],
};

const toPascalCase = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase()).replace(/\s+/g, '');

function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    clearLocalStorageIfNewDay();
    fetchRatings();
    loadUserRatings();
  }, []);

  const clearLocalStorageIfNewDay = () => {
    const today = new Date().toLocaleDateString('en-CA');
    if (localStorage.getItem("lastCleared") !== today) {
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("rated_")) localStorage.removeItem(key);
      });
      localStorage.setItem("lastCleared", today);
    }
  };

  const fetchRatings = async () => {
    const { data, error } = await supabase.from('ratings').select('*');
    if (error) {
      console.error('Error fetching ratings:', error);
    } else {
      const mealOrder = ["breakfast", "lunch", "snacks", "dinner"];
      setRatings(data.sort((a, b) => mealOrder.indexOf(a.meal) - mealOrder.indexOf(b.meal)));
    }
    setLoading(false);
  };

  const loadUserRatings = () => {
    const today = new Date().toISOString().split("T")[0];
    const storedRatings = {};

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("rated_")) {
        const storedData = JSON.parse(localStorage.getItem(key));
        if (storedData?.date === today) {
          storedRatings[key.replace("rated_", "")] = storedData.rating;
        }
      }
    });

    setUserRatings(storedRatings);
  };

  const isWithinTimeRange = (meal) => {
    if (!(meal in MEAL_TIMES)) return false;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return currentTime >= MEAL_TIMES[meal][0] && currentTime <= MEAL_TIMES[meal][1];
  };

  const handleStarClick = (meal, rating) => {
    if (localStorage.getItem(`rated_${meal}`)) {
      alert(`You have already rated ${meal}.`);
      return;
    }
    if (!isWithinTimeRange(meal)) {
      alert(`You can rate ${meal} only during its respective time.`);
      return;
    }
    setUserRatings((prev) => ({ ...prev, [meal]: rating }));
  };

  const renderStars = (rating) => {
  const filledStars = Math.floor(rating);  // Use floor instead of directly comparing decimal rating
  const hasHalfStar = rating - filledStars >= 0.5; // Check if there's a half star

  return (
    <span className="stars">
      {[...Array(5)].map((_, index) => (
        <span key={index} className={
          index < filledStars ? "full-star" :
          index === filledStars && hasHalfStar ? "half-star" :
          "empty-star"
        }>
          {index < filledStars ? '★' : index === filledStars && hasHalfStar ? '⯪' : '☆'}
        </span>
      ))}
      <span className="rating-number"> ({rating.toFixed(1)})</span>
    </span>
  );
};


  const renderUserStars = (meal) => {
    const userRating = userRatings[meal] || 0;
    const isRated = localStorage.getItem(`rated_${meal}`);

    return (
      <span className="stars">
        {[...Array(5)].map((_, index) => (
          <span
            key={index}
            className={index < userRating ? "full-star" : "empty-star"}
            onClick={() => handleStarClick(meal, index + 1)}
            style={{ opacity: isRated ? 0.5 : 1 }}
          >
            {index < userRating ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];

    const newRatings = Object.entries(userRatings).filter(([meal]) => !localStorage.getItem(`rated_${meal}`));
    if (newRatings.length === 0) return;

    for (const [meal, newRating] of newRatings) {
      const { data, error } = await supabase.from('ratings').select('average_rating, rating_count').eq('meal', meal).single();
      if (error) {
        console.error('Error fetching meal rating:', error);
        continue;
      }

      const { average_rating = 0, rating_count = 0 } = data;
      const newTotalRating = average_rating * rating_count + newRating;
      const newRatingCount = rating_count + 1;
      const newAverageRating = newTotalRating / newRatingCount;

      const { error: updateError } = await supabase
        .from('ratings')
        .update({ average_rating: newAverageRating, rating_count: newRatingCount })
        .eq('meal', meal);

      if (updateError) {
        console.error('Error updating rating:', updateError);
        continue;
      }

      localStorage.setItem(`rated_${meal}`, JSON.stringify({ date: today, rating: newRating }));
    }

    fetchRatings();
  };

  return (
    <div className="ratings">
      <h2>Daily Ratings</h2>
      {loading ? (
        <div className="loading">Loading ratings...</div>
      ) : ratings.length === 0 ? (
        <p>No ratings available</p>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Meal</th>
                <th>Average Rating</th>
                <th>Rating Count</th>
                <th>Your Rating</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map((meal, index) => (
                <tr key={index}>
                  <td>{toPascalCase(meal.meal)}</td>
                  <td className='avg'>{renderStars(meal.average_rating)}</td>
                  <td>{meal.rating_count}</td>
                  <td>{renderUserStars(meal.meal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="submit-btn-container">
        <button onClick={handleSubmit} className="submit-btn">Submit Ratings</button>
      </div>
    </div>
  );
}

export default Ratings;
