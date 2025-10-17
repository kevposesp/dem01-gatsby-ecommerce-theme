import React, { useState, useEffect } from 'react';
import { navigate } from 'gatsby';
import { useAuth } from '../../context/AuthContext';
import * as styles from './settings.module.css';

import AccountLayout from '../../components/AccountLayout';
import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import FormInputField from '../../components/FormInputField';
import Layout from '../../components/Layout/Layout';

import {
  validateEmail,
  validateStrongPassword,
  isAuth,
} from '../../helpers/general';

const SettingsPage = (props) => {
  const { user, updateProfile, isAuthenticated } = useAuth();
  
  if (isAuth() === false) {
    navigate('/login');
  }

  const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  };

  const errorState = {
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    password: '',
    confirmPassword: '',
  };

  const [updateForm, setUpdateForm] = useState(initialState);
  const [error, setError] = useState(errorState);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user && isAuthenticated()) {
      setUpdateForm({
        ...initialState,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleChange = (id, e) => {
    const tempForm = { ...updateForm, [id]: e };
    setUpdateForm(tempForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let validForm = true;
    const tempError = { ...errorState };

    if (updateForm.email !== '' && updateForm.email !== user?.email) {
      if (validateEmail(updateForm.email) !== true) {
        validForm = false;
        tempError.email =
          'Please use a valid email address, such as user@example.com.';
      }
    }

    if (updateForm.password !== '') {
      if (!updateForm.currentPassword) {
        validForm = false;
        tempError.currentPassword = 'Current password is required to change password';
      }
      
      if (validateStrongPassword(updateForm.password) === false) {
        validForm = false;
        tempError.password =
          'Password must have at least 8 characters, 1 lowercase, 1 uppercase and 1 numeric character.';
      }

      if (updateForm.password !== updateForm.confirmPassword) {
        validForm = false;
        tempError.confirmPassword = 'Confirm password not the same.';
      }
    }

    if (validForm === true) {
      const updates = {};
      
      if (updateForm.firstName && updateForm.firstName !== user?.firstName) {
        updates.firstName = updateForm.firstName;
      }
      if (updateForm.lastName && updateForm.lastName !== user?.lastName) {
        updates.lastName = updateForm.lastName;
      }
      if (updateForm.email && updateForm.email !== user?.email) {
        updates.email = updateForm.email;
      }
      if (updateForm.password) {
        updates.currentPassword = updateForm.currentPassword;
        updates.newPassword = updateForm.password;
      }

      if (Object.keys(updates).length > 0) {
        const result = await updateProfile(updates);
        
        if (result.success) {
          setError(errorState);
          setSuccessMessage('Profile updated successfully!');
          setUpdateForm({
            ...updateForm,
            currentPassword: '',
            password: '',
            confirmPassword: ''
          });
          setTimeout(() => setSuccessMessage(''), 3000);
        } else {
          setError({ ...errorState, email: result.error });
          setSuccessMessage('');
        }
      } else {
        setSuccessMessage('No changes to save');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } else {
      setError(tempError);
      setSuccessMessage('');
    }
  };

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/settings', label: 'Settings' },
          ]}
        />
        <h1>Settings</h1>
        {successMessage && (
          <div className={styles.successMessage}>
            {successMessage}
          </div>
        )}
        <div>
          <form onSubmit={(e) => handleSubmit(e)} noValidate>
            <div className={styles.nameSection}>
              <FormInputField
                id={'firstName'}
                value={updateForm.firstName}
                handleChange={(id, e) => handleChange(id, e)}
                type={'input'}
                labelName={'First Name'}
              />
              <FormInputField
                id={'lastName'}
                value={updateForm.lastName}
                handleChange={(id, e) => handleChange(id, e)}
                type={'input'}
                labelName={'Last Name'}
              />
              <FormInputField
                id={'email'}
                value={updateForm.email}
                handleChange={(id, e) => handleChange(id, e)}
                type={'email'}
                labelName={'Email'}
                error={error.email}
              />
            </div>
            <div className={styles.passwordContainer}>
              <h2>Change Password</h2>
              <div className={styles.passwordSection}>
                <FormInputField
                  id={'currentPassword'}
                  value={updateForm.currentPassword}
                  handleChange={(id, e) => handleChange(id, e)}
                  type={'password'}
                  labelName={'Current Password'}
                  error={error.currentPassword}
                />
                <FormInputField
                  id={'password'}
                  value={updateForm.password}
                  handleChange={(id, e) => handleChange(id, e)}
                  type={'password'}
                  labelName={'New Password'}
                  error={error.password}
                />
                <FormInputField
                  id={'confirmPassword'}
                  value={updateForm.confirmPassword}
                  handleChange={(id, e) => handleChange(id, e)}
                  type={'password'}
                  labelName={'Confirm Password'}
                  error={error.confirmPassword}
                />
                <Button level={'primary'} type={'submit'}>
                  update
                </Button>
              </div>
            </div>
          </form>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default SettingsPage;
