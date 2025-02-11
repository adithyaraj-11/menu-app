import React, { useState, useEffect } from 'react';
import './menu.css';

function Menu({ day, week }) {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (day && week) {
      fetchMenu();
    }

    async function fetchMenu() {
      try {
        const response = await fetch(`http://localhost:5000/api/menu/${day}/${week}`);
        if (!response.ok) {
          throw new Error('Failed to fetch menu');
        }
        const data = await response.json();
        setMenuItems(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [day, week]);

  if (loading) return <div>Loading menu...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="menu-container">
      {menuItems.map((mealType) => (
        <div key={mealType.meal} className="meal-section">
          <h3>{mealType.meal.toUpperCase()}</h3>
          <div className="meal-timing">
            {getMealTiming(mealType.meal)}
          </div>
          <ul>
            {mealType.items.split(', ').map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function getMealTiming(meal) {
  switch (meal.toLowerCase()) {
    case 'breakfast':
      return '(07:15 AM TO 08:45 AM)';
    case 'lunch':
      return '(11:45 AM TO 02:30 PM)';
    case 'snacks':
      return '(05:30 PM TO 06:30 PM)';
    case 'dinner':
      return '(07:15 PM TO 08:45 PM)';
    default:
      return '';
  }
}

export default Menu;
