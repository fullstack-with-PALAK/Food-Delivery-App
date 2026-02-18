import React, { useState, useEffect, useContext } from 'react'
import './Home.css'
import Header from '../../components/Header/Header'
import ExploreMenu from '../../components/ExploreMenu/ExploreMenu'
import FoodDisplay from '../../components/FoodDisplay/FoodDisplay'
import AppDownload from '../../components/AppDownload/AppDownload'
import { StoreContext } from '../../context/StoreContext'
import axios from 'axios'

const Home = () => {
  const [category, setCategory] = useState("All");
  const [topRated, setTopRated] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(false);
  const { url } = useContext(StoreContext);

  // Fetch top-rated foods for featured section
  useEffect(() => {
    const fetchFeaturedFoods = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${url}/api/food/top-rated?limit=6`);
        if (response.data.success) {
          setFeatured(response.data.data || []);
        }
      } catch (error) {
        console.error("Error fetching featured foods:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedFoods();
  }, [url]);

  return (
    <div className="home">
      <Header />
      
      {/* Featured Section */}
      {featured.length > 0 && (
        <div className="featured-section">
          <h2>Trending Now</h2>
          <div className="featured-grid">
            {featured.slice(0, 3).map((food) => (
              <div key={food._id} className="featured-card">
                <div className="featured-badge">⭐ {food.rating?.toFixed(1) || 'N/A'}</div>
                <img src={`${url}/images/${food.image}`} alt={food.name} />
                <div className="featured-info">
                  <h3>{food.name}</h3>
                  <p>{food.description?.substring(0, 50)}...</p>
                  <div className="featured-footer">
                    <span className="price">Rs. {food.price}</span>
                    {food.discountPercent > 0 && (
                      <span className="discount">{food.discountPercent}% OFF</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Section */}
      <ExploreMenu category={category} setCategory={setCategory} />
      
      {/* Foods Display */}
      <FoodDisplay category={category} />
      
      {/* App Download */}
      <AppDownload />
    </div>
  )
}

export default Home
