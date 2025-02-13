import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Import Supabase client
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
    fetchComments();
  }, []);

  useEffect(() => {
    filterComments();
  }, [allComments, filterMeal, filterDate]);

  const fetchComments = async () => {
    const { data, error } = await supabase.from('comments').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching comments:', error);
    } else {
      setAllComments(data);
      setFilteredComments(data);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!meal || !newComment.trim()) {
      setMessage('Please select a meal and write a comment.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    const now = new Date();
    const commentDate = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;

    const { error } = await supabase.from('comments').insert([{ meal, comment: newComment, date: commentDate }]);

    if (error) {
      console.error('Error adding comment:', error);
      setMessage('Failed to submit comment. Please try again.');
    } else {
      setMessage('Comment submitted successfully!');
      setNewComment('');
      setAllComments((prevComments) => [...prevComments, { meal, comment: newComment, date: commentDate }]);
    }

    setTimeout(() => setMessage(''), 3000);
  };

  const filterComments = () => {
    let filtered = allComments;
    if (filterMeal) {
      filtered = filtered.filter(comment => comment.meal === filterMeal);
    }
    if (filterDate) {
      filtered = filtered.filter(comment => comment.date === filterDate);
    }
    setFilteredComments(filtered);
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
            value={filterDate ? filterDate.split('/').reverse().join('-') : ''}
            onChange={(e) => {
              if (!e.target.value) return;
              const [year, month, day] = e.target.value.split('-');
              setFilterDate(`${year}/${month}/${day}`);
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
                    <td>{new Date(comment.date).toLocaleDateString('en-GB').replace(/\//g, '-')}</td>
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
