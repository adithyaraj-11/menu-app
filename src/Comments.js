import React, { useState, useEffect } from 'react';
import './Comments.css';

function Comments() {
  const [newComment, setNewComment] = useState('');
  const [meal, setMeal] = useState('');
  const [message, setMessage] = useState('');
  const [allComments, setAllComments] = useState([]);
  const [filteredComments, setFilteredComments] = useState([]);
  const [filterMeal, setFilterMeal] = useState('');
  const [filterDate, setFilterDate] = useState('');

  useEffect(() => {
    fetch('https://menu-app-553s.onrender.com/api/comments')
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data);

        const formattedData = data.map(comment => ({
          ...comment,
          date: comment.date.split('-').reverse().join('/')
        }));

        setAllComments(formattedData);
        setFilteredComments(formattedData);
      })
      .catch(error => console.error('Error fetching comments:', error));
  }, []);

  const filterComments = () => {
    let filtered = allComments;
  
    if (filterMeal) {
      filtered = filtered.filter(comment => comment.meal === filterMeal);
    }
  
    if (filterDate) {
      filtered = filtered.filter(comment => {
        const commentDate = new Date(comment.date).toLocaleDateString('en-IN');
        console.log("Comparing:", commentDate, "with", filterDate);
        return commentDate === filterDate;
      });
    }
  
    setFilteredComments(filtered);
  };
  
  useEffect(() => {
    filterComments();
  }, [allComments, filterMeal, filterDate]);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (meal && newComment.trim()) {
      fetch('https://menu-app-553s.onrender.com/api/comments/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal, comment: newComment }),
      })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            setMessage('Comment submitted successfully!');
            setNewComment('');

            const newCommentData = {
              meal,
              comment: newComment,
              date: new Date().toLocaleDateString('en-IN'),
            };

            setAllComments(prevComments => [...prevComments, newCommentData]);

            setTimeout(() => setMessage(''), 3000);
          } else {
            setMessage('Failed to submit comment. Please try again.');
          }
        })
        .catch(error => {
          console.error('Error adding comment:', error);
          setMessage('Failed to submit comment. Please try again.');
          setTimeout(() => setMessage(''), 3000);
        });
    } else {
      setMessage('Please select a meal and write a comment.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  

  return (
    <div className="comments">
      <h2>Submit Feedback for {meal || 'a meal'}</h2>

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

      {message && <p className="message">{message}</p>}

      <form onSubmit={handleCommentSubmit}>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit">Submit Comment</button>
      </form>

      <div className="filters">
        <h3>Filter Comments</h3>
        <div className="meal-filter">
          <label htmlFor="filterMeal">Filter by Meal: </label>
          <select id="filterMeal" value={filterMeal} onChange={(e) => setFilterMeal(e.target.value)}>
            <option value="">All Meals</option>
            <option value="breakfast">Breakfast</option>
            <option value="lunch">Lunch</option>
            <option value="snacks">Snacks</option>
            <option value="dinner">Dinner</option>
          </select>
        </div>

        <div className="date-filter">
          <label htmlFor="filterDate">Filter by Date: </label>
          <input
  id="filterDate"
  type="date"
  value={filterDate ? filterDate.split('/').reverse().join('-') : ''} // Convert DD/MM/YYYY to YYYY-MM-DD
  onChange={(e) => {
    const [year, month, day] = e.target.value.split('-');
    setFilterDate(`${day}/${month}/${year}`); // Convert YYYY-MM-DD to DD/MM/YYYY
  }}
/>
        </div>
      </div>

      <div className="comments-table">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Meal</th>
              <th>Comment</th>
            </tr>
          </thead>
        </table>
        <div className="table-body">
          <table>
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
    </div>
  );
}

export default Comments;
