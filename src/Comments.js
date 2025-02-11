import React, { useState, useEffect } from 'react';
import './Comments.css';

function Comments() {
  const [newComment, setNewComment] = useState('');
  const [meal, setMeal] = useState('');
  const [message, setMessage] = useState('');
  const [allComments, setAllComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [filterMeal, setFilterMeal] = useState('');

  // Fetch comments from the backend on component mount
  useEffect(() => {
    fetch('https://menu-app-553s.onrender.com/api/comments')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data);

        // Format date for all fetched comments
        const formattedData = data.map(comment => ({
          ...comment,
          date: new Date(comment.date).toLocaleDateString('en-IN'), // Ensure all dates are in 'en-IN' format
        }));

        setAllComments(formattedData);
        setFilteredComments(formattedData); // Initially, display all comments
      })
      .catch(error => console.error('Error fetching comments:', error));
  }, []);

  // Handle comment submission
  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (meal && newComment.trim()) {
      // Send the new comment to the backend
      fetch('https://menu-app-553s.onrender.com/api/comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal, comment: newComment }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setMessage('Comment submitted successfully!');
            setNewComment(''); // Clear the input field

            // Add new comment with the formatted date
            const newCommentData = {
              meal,
              comment: newComment,
              date: new Date().toLocaleDateString('en-IN'), // New comment's date formatted to 'en-IN'
            };

            setAllComments(prevComments => [
              ...prevComments,
              newCommentData, // Add the new comment with the formatted date
            ]);

            // Reapply filters after submitting the comment
            filterComments(filterMeal);

            // Reset the message after 3 seconds
            setTimeout(() => setMessage(''), 3000);
          } else {
            setMessage('Failed to submit comment. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error adding comment:', error);
          setMessage('Failed to submit comment. Please try again.');
        });
    } else {
      setMessage('Please select a meal and write a comment.');
    }
  };

  // Filter the comments based on selected meal
  const filterComments = (mealFilter) => {
    let filtered = allComments;

    // If a filterMeal is set, apply the filter
    if (mealFilter) {
      filtered = filtered.filter(comment => comment.meal === mealFilter);
    }

    setFilteredComments(filtered);
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const selectedMeal = e.target.value;
    setFilterMeal(selectedMeal); // Update filterMeal state
    filterComments(selectedMeal); // Immediately filter using the selected meal
  };

  return (
    <div className="comments">
      <h2>Submit Feedback for {meal || 'a meal'}</h2>

      {/* Dropdown for selecting the meal */}
      <div className="meal-select">
        <label htmlFor="meal">Select Meal: </label>
        <select id="meal" value={meal} onChange={(e) => setMeal(e.target.value)}>
          <option value="">Select a meal</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="snacks">Snacks</option>
          <option value="dinner">Dinner</option>
        </select>
      </div>

      {/* Success/Error message */}
      {message && <p className="message">{message}</p>}

      {/* Comment Submission Form */}
      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit">Submit Comment</button>
      </form>

      {/* Filters */}
      <div className="filters">
        <h3>Filter Comments</h3>
        <div className="meal-filter">
          <label htmlFor="filterMeal">Filter by Meal: </label>
          <select
            id="filterMeal"
            value={filterMeal}
            onChange={handleFilterChange} // Trigger filter on change
          >
            <option value="">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Snacks</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>
      </div>

      {/* Comments Table */}
      <div className="comments-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Meal</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {filteredComments.length > 0 ? (
              filteredComments.map((comment, index) => (
                <tr key={index}>
                  <td>{comment.date}</td>
                  <td>{comment.meal}</td>
                  <td>{comment.comment}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No comments available.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Comments;
