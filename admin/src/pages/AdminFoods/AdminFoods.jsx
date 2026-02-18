import React, { useContext, useEffect, useState } from 'react';
import './AdminFoods.css';
import { StoreContext } from '../../context/StoreContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const AdminFoods = () => {
  const { url, token } = useContext(StoreContext);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Pizza',
    vegetarian: false,
    preparationTime: 30
  });
  const [imageFile, setImageFile] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFoods();
  }, [token]);

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/api/admin/foods?page=1&limit=20`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFoods(response.data.foods);
      }
    } catch (error) {
      console.error('Failed to fetch foods:', error);
      toast.error('Failed to load foods');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', formData.price);
    formDataToSend.append('category', formData.category);
    formDataToSend.append('vegetarian', formData.vegetarian);
    formDataToSend.append('preparationTime', formData.preparationTime);

    if (imageFile) {
      formDataToSend.append('image', imageFile);
    }

    try {
      if (editingId) {
        // Update
        const response = await axios.put(
          `${url}/api/admin/food/update/${editingId}`,
          formDataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success('Food updated successfully');
          setFoods(foods.map((f) => (f._id === editingId ? response.data.food : f)));
          resetForm();
        }
      } else {
        // Add new
        const response = await axios.post(
          `${url}/api/admin/food/add`,
          formDataToSend,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success('Food added successfully');
          setFoods([response.data.food, ...foods]);
          resetForm();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to save food');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this food?')) {
      try {
        const response = await axios.delete(
          `${url}/api/admin/food/delete/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data.success) {
          toast.success('Food deleted successfully');
          setFoods(foods.filter((f) => f._id !== id));
        }
      } catch (error) {
        console.error('Delete error:', error);
        toast.error('Failed to delete food');
      }
    }
  };

  const handleEdit = (food) => {
    setFormData({
      name: food.name,
      description: food.description,
      price: food.price,
      category: food.category,
      vegetarian: food.vegetarian,
      preparationTime: food.preparationTime || 30
    });
    setEditingId(food._id);
    setShowForm(true);
    window.scrollTo(0, 0);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'Pizza',
      vegetarian: false,
      preparationTime: 30
    });
    setImageFile(null);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredFoods = foods.filter(
    (food) =>
      food.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      food.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-foods-container">
      {/* Header */}
      <div className="page-header">
        <h1>Manage Foods</h1>
        <button
          className="btn-add-food"
          onClick={() => {
            if (showForm) resetForm();
            else setShowForm(true);
          }}
        >
          {showForm ? '✕ Close' : '+ Add New Food'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="food-form">
          <div className="form-row">
            <div className="form-group">
              <label>Food Name *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., Margherita Pizza"
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
              >
                <option>Pizza</option>
                <option>Burger</option>
                <option>Salad</option>
                <option>Pasta</option>
                <option>Dessert</option>
                <option>Beverage</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Price (₹) *</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                step="0.01"
                placeholder="100"
              />
            </div>
            <div className="form-group">
              <label>Preparation Time (mins)</label>
              <input
                type="number"
                name="preparationTime"
                value={formData.preparationTime}
                onChange={handleInputChange}
                min="5"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="4"
              placeholder="Describe the food..."
            ></textarea>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Image</label>
              <input
                type="file"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
              />
            </div>
            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="vegetarian"
                  checked={formData.vegetarian}
                  onChange={handleInputChange}
                />
                <span>Vegetarian</span>
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-submit">
              {editingId ? 'Update Food' : 'Add Food'}
            </button>
            <button type="button" onClick={resetForm} className="btn-cancel">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search foods..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Foods Table */}
      {loading ? (
        <div className="loading">Loading foods...</div>
      ) : filteredFoods.length === 0 ? (
        <div className="empty-state">No foods found</div>
      ) : (
        <div className="foods-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Prep Time</th>
                <th>Veg</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFoods.map((food) => (
                <tr key={food._id}>
                  <td>{food.name}</td>
                  <td>{food.category}</td>
                  <td>₹{food.price?.toFixed(2)}</td>
                  <td>{food.preparationTime || 30} mins</td>
                  <td>{food.vegetarian ? '✓' : '-'}</td>
                  <td className="actions">
                    <button
                      onClick={() => handleEdit(food)}
                      className="btn-edit"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDelete(food._id)}
                      className="btn-delete"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminFoods;
