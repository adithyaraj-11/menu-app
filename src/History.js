import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import './History.css';

function History() {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to current month

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth]);

  const fetchHistory = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('past_ratings')
      .select('*')
      .order('date', { ascending: false });

    if (error) {
      console.error('Error fetching history:', error);
    } else {
      // Filter data by selected month
      const filteredData = data.filter(entry => entry.date.split('-')[1].startsWith(selectedMonth.split('-')[1]));
      setHistory(filteredData);
    }
    setIsLoading(false);
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
      
      <label id="month-filter">Filter by Month: </label>
      <input
        type="month"
        id="month-filter"
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
      />
      
      <div className="history-table-container">
        {isLoading ? (
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
                  <td colSpan="5">No history available for this month.</td>
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
