import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './History.css';

function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // New loading state

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true); // Start loading
    const { data, error } = await supabase
      .from('past_ratings')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      setHistory(data);
    }
    setIsLoading(false); // Stop loading
  };

  const renderStars = (rating) => {
    const roundedRating = Math.round(rating);
    return (
      <span className="stars">
        {[...Array(5)].map((_, index) => (
          <span key={index} className={index < roundedRating ? "full-star" : "empty-star"}>
            {index < roundedRating ? '★' : '☆'}
          </span>
        ))}
        <span className="rating-number"> ({rating.toFixed(1)})</span>
      </span>
    );
  };

  return (
    <div className="history">
      <h2>Past Ratings</h2>
      <div className="history-table-container">
        {isLoading ? ( // Show loading message while fetching data
          <p>Loading history...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Breakfast</th>
                <th>Lunch</th>
                <th>Snacks</th>
                <th>Dinner</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.date}</td>
                    <td>{renderStars(entry.breakfast)}</td>
                    <td>{renderStars(entry.lunch)}</td>
                    <td>{renderStars(entry.snacks)}</td>
                    <td>{renderStars(entry.dinner)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">No history available.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default History;
