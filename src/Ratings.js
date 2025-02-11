import React, { useState, useEffect } from 'react';
import './Ratings.css'; // Ensure you have the necessary styles


const mealTimes = {
  breakfast: [7 * 60 + 15, 8 * 60 + 45],
  lunch: [11 * 60 + 45, 14 * 60 + 30],
  snacks: [17 * 60 + 30, 18 * 60 + 30],
  dinner: [19 * 60 + 15, 20 * 60 + 45],
};

function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [userRatings, setUserRatings] = useState({});

  useEffect(() => {
    fetch('https://localhost:3000/api/ratings')
      .then(response => response.json())
      .then(data => setRatings(data))
      .catch(error => console.error('Error fetching ratings:', error));
  }, []);

  const isWithinTimeRange = (mealType) => {
    if (!mealType || !(mealType in mealTimes)) {
      console.error(`Invalid meal type: ${mealType}`);
      return false; // Prevent crashes
    }
  
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    return currentTime >= mealTimes[mealType][0] && currentTime <= mealTimes[mealType][1];
  };

  const handleStarClick = (meal, mealType, rating) => {
    if (!isWithinTimeRange(mealType)) {
      alert(`You can rate only during its respective time.`);
      return;
    }
    setUserRatings(prevState => ({
      ...prevState,
      [meal]: rating
    }));
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

  const renderUserStars = (meal, mealType) => {
    const userRating = userRatings[meal] || 0;
    return (
      <span className="stars">
        {Array.from({ length: 5 }, (_, index) => (
          <span
            key={index}
            className={index < userRating ? "full-star" : "empty-star"}
            onClick={() => handleStarClick(meal, mealType, index + 1)}
          >
            {index < userRating ? '★' : '☆'}
          </span>
        ))}
      </span>
    );
  };

  const handleSubmit = () => {
    ratings.forEach(meal => {
      const newRating = userRatings[meal.meal];
      if (newRating) {
        if (!isWithinTimeRange(meal.meal_type)) {
          alert(`You can rate ${meal.meal_type} only during its respective time.`);
          return;
        }

        fetch('https://localhost:3000/api/ratings/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meal: meal.meal, newRating }),
        })
          .then(response => response.json())
          .then(() => {
            fetch('https://localhost:3000/api/ratings')
              .then(response => response.json())
              .then(data => setRatings(data))
              .catch(error => console.error('Error fetching updated ratings:', error));
          })
          .catch(error => console.error('Error updating ratings:', error));
      }
    });
  };

  return (
    <div className="ratings">
      <h2>Daily Ratings</h2>
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
                  <td>{meal.meal}</td>
                  <td>{renderStars(meal.average_rating)}</td>
                  <td>{meal.rating_count}</td>
                  <td>{renderUserStars(meal.meal, meal.meal_type)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      <div className="submit-btn-container">
        <button onClick={handleSubmit} className="submit-btn">Submit Ratings</button>
      </div>
    </div>
  );
}

export default Ratings;