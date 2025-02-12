import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
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
        // Fetch menu items from Supabase
        const { data: menuData, error: menuError } = await supabase
          .from("menu")
          .select("meal, item")
          .eq("day", day)
          .eq("week", week);

        if (menuError) throw menuError;

        // Fetch ratings from Supabase
        const { data: ratingsData, error: ratingsError } = await supabase
          .from("ratings")
          .select("meal, average_rating");

        if (ratingsError) throw ratingsError;

        // Merge ratings into menu items
        const menuWithRatings = menuData.reduce((acc, { meal, item }) => {
          let mealEntry = acc.find(m => m.meal.toLowerCase() === meal.toLowerCase());

          if (!mealEntry) {
            mealEntry = { meal, items: [], average_rating: null };
            acc.push(mealEntry);
          }

          mealEntry.items.push(item);

          const rating = ratingsData.find(r => r.meal.toLowerCase() === meal.toLowerCase());
          if (rating) {
            mealEntry.average_rating = rating.average_rating > 0 ? rating.average_rating : null;
          }

          return acc;
        }, []);

        setMenuItems(menuWithRatings);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }
  }, [day, week]);

  if (loading) return <div className='loading'><div>Loading menu...</div></div>;
  if (error) return <div className='loading'><div>Error: {error}</div></div>;

  return (
    <div className="menu-container">
      {menuItems.map((mealType) => (
        <div key={mealType.meal} className={`meal-section ${mealType.meal.toLowerCase()}`}>
          <h3>
            {mealType.meal.toUpperCase()} 
            {mealType.average_rating !== null ? ` (${mealType.average_rating.toFixed(1)} ★)` : ''}
          </h3>
          <div className="meal-timing">{getMealTiming(mealType.meal)}</div>
          <ul>
            {mealType.items.map((item, index) => (
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
