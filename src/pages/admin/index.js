import React, { useEffect } from 'react';
import { navigate } from 'gatsby';
import { useAuth } from '../../context/AuthContext';

import AdminLayout from '../../components/Admin/Layout/Layout';
import Breadcrumbs from '../../components/Breadcrumbs';

const AdminPage = (props) => {
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      const hasAdmin = user && Array.isArray(user.roles) && user.roles.includes('admin');
      if (!isAuthenticated() || !hasAdmin) {
        navigate('/');
      }
    }
  }, [loading, user]);

  if (loading) {
    return (
      <AdminLayout>
        <div>Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <>
      <AdminLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/admin', label: 'Admin' }
          ]}
        />

        <h1>Admin Dashboard</h1>

        <p>Bienvenido al panel de administradores. Aquí podrás gestionar el sitio.</p>
      </AdminLayout>
    </>
  );
};

export default AdminPage;
