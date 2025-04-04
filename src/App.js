import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './react.svg';
import Menu from './menu';
import Ratings from './Ratings';
import Comments from './Comments';
import History from './History';
import image1 from './week1&3.jpg';
import image2 from './week2&4.jpg';

function App() {
  const [currentDay, setCurrentDay] = useState('');
  const [weekNumber, setWeekNumber] = useState(1);
  const [showImages, setShowImages] = useState(false);
  const [showRatings, setShowRatings] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const date = new Date();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    setCurrentDay(dayNames[date.getDay()]);
  
    const firstOfYear = new Date(date.getFullYear(), 0, 1);
    while (firstOfYear.getDay() !== 1) {
      firstOfYear.setDate(firstOfYear.getDate() + 1);
    }
  
    const diffInTime = date - firstOfYear;
    const diffInDays = Math.floor(diffInTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(diffInDays / 7);
    const calculatedWeek = (totalWeeks % 4) + 1;
    setWeekNumber(calculatedWeek);
  }, []);

  const handleMenuClick = () => {
    setShowImages(true);
    setShowRatings(false);
    setShowComments(false);
    setMenuOpen(false);
    setShowHistory(false);
  };

  const handleRatingsClick = () => {
    setShowRatings(true);
    setShowImages(false);
    setShowComments(false);
    setMenuOpen(false);
    setShowHistory(false);
  };

  const handleCommentsClick = () => {
    setShowComments(true);
    setShowImages(false);
    setShowRatings(false);
    setMenuOpen(false);
    setShowHistory(false);
  };

  const handleHistoryClick = () => {
    setShowComments(false);
    setShowImages(false);
    setShowRatings(false);
    setMenuOpen(false);
    setShowHistory(true);
  };

  const handleHomeClick = () => {
    setShowImages(false);
    setShowRatings(false);
    setShowComments(false);
    setMenuOpen(false);
    setShowHistory(false);
  };

  return (
    <div className="App">
      <nav className="navbar">
        <div className="logo">
          <h1>Mega Mess App</h1>
        </div>
        <div 
            className={`menu-toggle ${menuOpen ? 'open' : ''}`} 
            onClick={() => setMenuOpen(!menuOpen)}
          >
            ☰
          </div>
        <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
          <a href="#home" onClick={handleHomeClick}>Home</a>
          <a href="#menu" onClick={handleMenuClick}>Menu</a>
          <a href="#ratings" onClick={handleRatingsClick}>Ratings</a>
          <a href="#comments" onClick={handleCommentsClick}>Comments</a>
          <a href="#history" onClick={handleHistoryClick}>History</a>
        </div>
      </nav>

      {!showImages && !showRatings && !showComments && !showHistory && (
        <header className="App-header">
          <h2>Menu for {currentDay}</h2>
          <h4>Week {weekNumber}</h4>
        </header>
      )}

      {showImages && (
        <div className="image-container">
          <img src={image1} alt="Week 1 & 3" />
          <img src={image2} alt="Week 2 & 4" />
        </div>
      )}

      {!showImages && showRatings && <Ratings />}
      {!showImages && !showRatings && !showComments && !showHistory && <Menu day={currentDay} week={weekNumber} />}
      {showComments && <Comments />}
      {showHistory && <History />}

      <footer className="footer">
        Developed with 
        <img src={logo} alt="React Logo" className="react-logo" />
        , by Adithyaraj K
      </footer>
    </div>
  );
}

export default App;
