import React, { useContext, useEffect, useState } from "react";
import "./FoodDisplay.css";
import { StoreContext } from "../../context/StoreContext";
import FoodItem from "../FoodItem/FoodItem";
import axios from "axios";

const FoodDisplay = ({ category }) => {
  const { food_list, url, setFoodList } = useContext(StoreContext);
  const [loaded, setLoaded] = useState(false);
  const [filteredFoods, setFilteredFoods] = useState([]);

  // Fetch foods from API if not already loaded
  useEffect(() => {
    const fetchFoods = async () => {
      try {
        if (!loaded || food_list.length === 0) {
          const response = await axios.get(`${url}/api/food/list`);
          if (response.data.success) {
            setFoodList(response.data.data);
            setLoaded(true);
          }
        }
      } catch (error) {
        console.error("Error fetching foods:", error);
      }
    };

    fetchFoods();
  }, [url, loaded, setFoodList]);

  // Filter foods by category
  useEffect(() => {
    if (category === "All") {
      setFilteredFoods(food_list);
    } else {
      setFilteredFoods(food_list.filter(item => item.category === category));
    }
  }, [category, food_list]);

  return (
    <div className="food-display" id="food-display">
      <h2>
        {category === "All" ? "All Dishes" : `${category} Near You`}
      </h2>
      {filteredFoods.length === 0 ? (
        <div className="empty-state">
          <p>No dishes available in this category</p>
        </div>
      ) : (
        <div className="food-display-list">
          {filteredFoods.map((item) => (
            <FoodItem
              key={item._id}
              id={item._id}
              name={item.name}
              description={item.description}
              price={item.price}
              image={item.image}
              rating={item.rating}
              reviewCount={item.reviewCount}
              isVegetarian={item.isVegetarian}
              preparationTime={item.preparationTime}
              discountPercent={item.discountPercent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodDisplay;
