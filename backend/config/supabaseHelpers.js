/**
 * Supabase Query Helpers
 * Helper functions to simplify database operations throughout the app
 */

import { supabase } from './supabase.js';

// ============== USER OPERATIONS ==============

export const userQuery = {
  findByEmail: async (email) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .single();
    return { data, error };
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  create: async (userData) => {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    return { data, error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },
};

// ============== FOOD OPERATIONS ==============

export const foodQuery = {
  findAll: async (filters = {}) => {
    let query = supabase.from('foods').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.available !== undefined) {
      query = query.eq('available', filters.available);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    return { data, error };
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('foods')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  create: async (foodData) => {
    const { data, error } = await supabase
      .from('foods')
      .insert([foodData])
      .select()
      .single();
    return { data, error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('foods')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  delete: async (id) => {
    const { data, error } = await supabase
      .from('foods')
      .delete()
      .eq('id', id);
    return { data, error };
  },

  count: async () => {
    const { count, error } = await supabase
      .from('foods')
      .select('*', { count: 'exact', head: true });
    return { count, error };
  },

  paginated: async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    let query = supabase.from('foods').select('*');

    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data: foods, error } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Get total count
    let countQuery = supabase
      .from('foods')
      .select('id', { count: 'exact', head: true });

    if (filters.category) {
      countQuery = countQuery.eq('category', filters.category);
    }

    const { count } = await countQuery;

    return { foods, count, error };
  },
};

// ============== CART OPERATIONS ==============

export const cartQuery = {
  addItem: async (userId, foodId, quantity) => {
    const { data, error } = await supabase
      .from('cart_items')
      .insert([
        {
          user_id: userId,
          food_id: foodId,
          quantity,
        },
      ])
      .select()
      .single();
    return { data, error };
  },

  updateQuantity: async (userId, foodId, quantity) => {
    const { data, error } = await supabase
      .from('cart_items')
      .update({ quantity })
      .eq('user_id', userId)
      .eq('food_id', foodId)
      .select()
      .single();
    return { data, error };
  },

  removeItem: async (userId, foodId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId)
      .eq('food_id', foodId);
    return { data, error };
  },

  getCart: async (userId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select(
        `
        id,
        user_id,
        food_id,
        quantity,
        foods (id, name, price, image, available)
      `
      )
      .eq('user_id', userId);
    return { data, error };
  },

  clearCart: async (userId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', userId);
    return { data, error };
  },

  getItem: async (userId, foodId) => {
    const { data, error } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('food_id', foodId)
      .single();
    return { data, error };
  },
};

// ============== ORDER OPERATIONS ==============

export const orderQuery = {
  create: async (orderData) => {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();
    return { data, error };
  },

  findById: async (id) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  findByUser: async (userId) => {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  update: async (id, updates) => {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data, error };
  },

  findAll: async (filters = {}) => {
    let query = supabase.from('orders').select('*');

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.order('created_at', {
      ascending: false,
    });

    return { data, error };
  },
};

export default {
  userQuery,
  foodQuery,
  cartQuery,
  orderQuery,
};
