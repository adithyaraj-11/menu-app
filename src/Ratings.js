import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase client
import './Ratings.css';

const mealTimes = {
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
    fetchRatings();
    loadUserRatings();
  
    const clearLocalStorageAtMidnight = () => {
      const today = new Date().toISOString().split("T")[0];
      const lastCleared = localStorage.getItem("lastCleared");
  
      if (lastCleared !== today) {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith("rated_")) {
            localStorage.removeItem(key);
          }
        });
        localStorage.setItem("lastCleared", today);
      }
    };
  
    clearLocalStorageAtMidnight();
  
    const now = new Date();
    const millisUntilMidnight = 
      new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0) - now;
  
    const timer = setTimeout(() => {
      clearLocalStorageAtMidnight();
      setInterval(clearLocalStorageAtMidnight, 24 * 60 * 60 * 1000);
    }, millisUntilMidnight);
  
    return () => clearTimeout(timer);
  }, []);

  const fetchRatings = async () => {
    const { data, error } = await supabase.from('ratings').select('*');
    if (error) {
      console.error('Error fetching ratings:', error);
    } else {
      const mealOrder = ["breakfast", "lunch", "snacks", "dinner"];
      const sortedData = data.sort((a, b) => mealOrder.indexOf(a.meal) - mealOrder.indexOf(b.meal));
      setRatings(sortedData);
      setLoading(false);
    }
  };

  const loadUserRatings = () => {
    const today = new Date().toISOString().split("T")[0];
    const storedRatings = {};
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("rated_")) {
        const storedData = JSON.parse(localStorage.getItem(key));
        if (storedData && storedData.date === today) {
          storedRatings[key.replace("rated_", "")] = storedData.rating;
        }
      }
    });
    setUserRatings(storedRatings);
  };

  const isWithinTimeRange = (mealType) => {
    if (!mealType || !(mealType in mealTimes)) return false;
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    return currentTime >= mealTimes[mealType][0] && currentTime <= mealTimes[mealType][1];
  };

  const handleStarClick = (meal, rating) => {
    if (!meal) return;
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
    const fullStars = Math.floor(rating);
    const halfStars = Math.ceil(rating - fullStars);
    const emptyStars = 5 - fullStars - halfStars;

    return (
      <span className="stars">
        {Array(fullStars).fill('★').map((star, index) => (
          <span key={`full-${index}`} className="full-star">{star}</span>
        ))}
        {Array(halfStars).fill('☆').map((star, index) => (
          <span key={`half-${index}`} className="half-star">{star}</span>
        ))}
        {Array(emptyStars).fill('☆').map((star, index) => (
          <span key={`empty-${index}`} className="empty-star">{star}</span>
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
        {Array.from({ length: 5 }, (_, index) => (
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

    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("rated_")) {
        const storedData = JSON.parse(localStorage.getItem(key));
        if (!storedData || storedData.date !== today) {
          localStorage.removeItem(key);
        }
      }
    });

    const newRatings = Object.entries(userRatings).filter(([meal]) => !localStorage.getItem(`rated_${meal}`));
    if (newRatings.length === 0) return;

    for (const [meal, newRating] of newRatings) {
      const { data, error } = await supabase.from('ratings').select('average_rating, rating_count').eq('meal', meal).single();

      if (error) {
        console.error('Error fetching meal rating:', error);
        continue;
      }

      const { average_rating, rating_count } = data || { average_rating: 0, rating_count: 0 };
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
