/**
 * @file customer.controller.js
 * @description Customer Controller for handling CRUD operations (ES6)
 */

import CustomerModel from '../models/customer.model.js';
import asyncHandler from '../utils/asyncHandler.js'; // Error handling wrapper

// 1. TAMAM CUSTOMERS KO GET KARNA
export const getCustomers = asyncHandler(async (req, res) => {
  const customers = await CustomerModel.getAll();
  res.status(200).json({
    success: true,
    count: customers.length,
    data: customers
  });
});

// 2. SINGLE CUSTOMER DETAILS GET KARNA
export const getCustomerById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const customer = await CustomerModel.getById(id);

  if (!customer) {
    return res.status(404).json({
      success: false,
      message: `Customer not found with id of ${id}`
    });
  }

  res.status(200).json({
    success: true,
    data: customer
  });
});

// 3. NAYA CUSTOMER ADD/CREATE KARNA (Updated with Smart Mapping)
export const createCustomer = asyncHandler(async (req, res) => {
  let { 
    first_name, 
    last_name, 
    name, 
    email, 
    phone, 
    phone_number, 
    cnic, 
    gender, 
    dob,
    emergency_contact_name,
    emergency_contact_phone,
    address, 
    status,
    is_active 
  } = req.body;

  // Agar frontend se 'name' aa raha hai aur 'first_name' khali hai, toh usay split kar lein
  if (!first_name && name) {
    const nameParts = name.trim().split(' ');
    first_name = nameParts[0];
    last_name = nameParts.slice(1).join(' ') || null;
  }

  // Phone number mapping (phone ya phone_number mein se jo bhi aaye)
  const finalPhone = phone || phone_number;

  // Status ('Active' / 'Inactive') ko boolean mein convert karna
  const activeStatus = is_active !== undefined ? is_active : (status === 'Active' || status === true);

  // Basic validation check
  if (!first_name || !email || !finalPhone) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name/first name, email, and phone number.'
    });
  }

  const newCustomer = await CustomerModel.create({
    first_name,
    last_name: last_name || null, // Agar last name na ho toh null pass ho jaye ga
    email,
    phone: finalPhone,
    cnic: cnic || null,
    gender: gender || 'male',
    dob: dob || null,
    emergency_contact_name: emergency_contact_name || null,
    emergency_contact_phone: emergency_contact_phone || null,
    address: address || null,
    is_active: activeStatus
  });

  res.status(201).json({
    success: true,
    message: 'Customer created successfully!',
    data: newCustomer
  });
});

// 4. CUSTOMER DETAILS UPDATE KARNA
export const updateCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingCustomer = await CustomerModel.getById(id);
  if (!existingCustomer) {
    return res.status(404).json({
      success: false,
      message: `Customer not found with id of ${id}`
    });
  }

  const updated = await CustomerModel.update(id, req.body);

  if (!updated) {
    return res.status(400).json({
      success: false,
      message: 'Failed to update customer details.'
    });
  }

  res.status(200).json({
    success: true,
    message: 'Customer updated successfully!'
  });
});

// 5. CUSTOMER DELETE KARNA
export const deleteCustomer = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingCustomer = await CustomerModel.getById(id);
  if (!existingCustomer) {
    return res.status(404).json({
      success: false,
      message: `Customer not found with id of ${id}`
    });
  }

  await CustomerModel.delete(id);

  res.status(200).json({
    success: true,
    message: 'Customer deleted successfully!'
  });
});