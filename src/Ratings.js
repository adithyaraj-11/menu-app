import React, { useState, useEffect } from 'react';
import './Ratings.css'; // Ensure you have the necessary styles

function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [userRatings, setUserRatings] = useState({}); // Store user ratings for each meal

  useEffect(() => {
    // Fetch ratings from the server
    fetch('http://localhost:5000/api/ratings')
      .then(response => response.json())
      .then(data => setRatings(data))
      .catch(error => console.error('Error fetching ratings:', error));
  }, []);

  // Function to convert average rating to stars
  const renderStars = (rating) => {
    const totalStars = 5; // Total number of stars (you can change this if you want a different max rating scale)
    const fullStars = Math.floor(rating); // Full stars
    const halfStars = Math.ceil(rating - fullStars); // Half stars
    const emptyStars = totalStars - fullStars - halfStars; // Empty stars

    return (
      <span className="stars">
        {/* Render full stars */}
        {Array(fullStars).fill('★').map((star, index) => (
          <span key={`full-${index}`} className="full-star">{star}</span>
        ))}
        {/* Render half stars */}
        {Array(halfStars).fill('☆').map((star, index) => (
          <span key={`half-${index}`} className="half-star">{star}</span>
        ))}
        {/* Render empty stars */}
        {Array(emptyStars).fill('☆').map((star, index) => (
          <span key={`empty-${index}`} className="empty-star">{star}</span>
        ))}
        {/* Display the numeric rating in brackets */}
        <span className="rating-number"> ({rating.toFixed(1)})</span>
      </span>
    );
  };

  // Handle user clicking on a star for a specific meal
  const handleStarClick = (meal, rating) => {
    setUserRatings(prevState => ({
      ...prevState,
      [meal]: rating
    }));
  };

  // Render stars for user input (hoverable and clickable)
  const renderUserStars = (meal) => {
    const userRating = userRatings[meal] || 0;
    const totalStars = 5;

    return (
      <span className="stars">
        {Array.from({ length: totalStars }, (_, index) => {
          return (
            <span
              key={index}
              className={index < userRating ? "full-star" : "empty-star"}
              onClick={() => handleStarClick(meal, index + 1)} // Set rating on click
            >
              {index < userRating ? '★' : '☆'}
            </span>
          );
        })}
      </span>
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    const updatedRatings = ratings.map(meal => {
      const newRating = userRatings[meal.meal];
      if (newRating) {
        // Update the rating in the backend
        fetch('http://localhost:5000/api/ratings/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meal: meal.meal,
            newRating,
          }),
        })
          .then(response => response.json())
          .then(() => {
            // Re-fetch the ratings after update
            fetch('http://localhost:5000/api/ratings')
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
      <h2>Meal Ratings</h2>
      {ratings.length === 0 ? (
        <p>No ratings available</p>
      ) : (
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
                <td>{renderUserStars(meal.meal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="submit-btn-container">
      <button onClick={handleSubmit} className="submit-btn">Submit Ratings</button>
      </div>
    </div>
  );
}

export default Ratings;
