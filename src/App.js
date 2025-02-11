import React, { useState, useEffect } from 'react';
import './App.css';
import Menu from './menu';
import Ratings from './Ratings';
import Comments from './Comments'; // Import the Comments component
import image1 from './week1&3.jpg';
import image2 from './week2&4.jpg';

function App() {
  const [currentDay, setCurrentDay] = useState('');
  const [monthWeekNumber, setMonthWeekNumber] = useState(1);
  const [showImages, setShowImages] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [showComments, setShowComments] = useState(false); // State to track Comments visibility
  const [mealForComments, setMealForComments] = useState(''); // Track which meal to show comments for

  useEffect(() => {
    const date = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = date.getDay();
    setCurrentDay(dayNames[dayOfWeek]);

    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    let firstMonday = startOfMonth;
    if (firstMonday.getDay() !== 1) {
      firstMonday.setDate(firstMonday.getDate() + ((8 - firstMonday.getDay()) % 7));
    }

    const daysSinceFirstMonday = Math.floor((date - firstMonday) / (1000 * 60 * 60 * 24));
    let currentMonthWeek = Math.ceil((daysSinceFirstMonday + 1) / 7);
    currentMonthWeek = currentMonthWeek > 4 ? 1 : currentMonthWeek;

    setMonthWeekNumber(currentMonthWeek);
  }, []);

  const handleMenuClick = () => {
    setShowImages(true);
    setShowRatings(false);
    setShowComments(false);
  };

  const handleRatingsClick = () => {
    setShowRatings(true);
    setShowImages(false);
    setShowComments(false);
  };

  const handleCommentsClick = (meal) => {
    setMealForComments(meal); // Set the meal for which comments should be shown
    setShowComments(true);
    setShowImages(false);
    setShowRatings(false);
  };

  const handleHomeClick = () => {
    setShowImages(false);
    setShowRatings(false);
    setShowComments(false);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">
          <h1>Mega Mess Menu</h1>
        </div>
        <div className="nav-links">
          <a href="#home" onClick={handleHomeClick}>Home</a>
          <a href="#menu" onClick={handleMenuClick}>Menu</a>
          <a href="#ratings" onClick={handleRatingsClick}>Ratings</a>
          <a href="#comments" onClick={() => handleCommentsClick('breakfast')}>Comments</a> {/* Add Comments link */}
        </div>
      </nav>

      {!showImages && !showRatings && !showComments && (
        <header className="App-header">
          <h2>Menu for {currentDay}</h2>
          <h4>Week {monthWeekNumber} of the month</h4>
        </header>
      )}

      {showImages && (
        <div className="image-container">
          <img src={image1} alt="Image 1" />
          <img src={image2} alt="Image 2" />
        </div>
      )}

      {!showImages && showRatings && <Ratings />}
      {!showImages && !showRatings && !showComments && <Menu day={currentDay} week={monthWeekNumber} />}
      {showComments && <Comments />}
    </div>
  );
}

export default App;
