import React, { useState } from 'react';
import * as styles from './favorites.module.css';

import AccountLayout from '../../components/AccountLayout';
import Button from '../../components/Button';
import Breadcrumbs from '../../components/Breadcrumbs';
import FavoriteCard from '../../components/FavoriteCard/FavoriteCard';
import Layout from '../../components/Layout/Layout';
import Modal from '../../components/Modal';

const FavoritesPage = (props) => {
  const sampleFavorite1 = {
    color: 'Anthracite Melange',
    size: 'XS',
    img: '/products/shirt1.jpg',
    alt: 'favorite 1',
  };

  const sampleFavorite2 = {
    color: 'Purple Pale',
    size: 'XS',
    img: '/products/shirt2.jpg',
    alt: 'favorite 2',
  };

  const sampleFavorite3 = {
    color: 'Moss Green',
    size: 'S',
    img: '/products/shirt3.jpg',
    alt: 'favorite 3',
  };

  const [showDelete, setShowDelete] = useState(false);

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/favorites', label: 'Favorites' },
          ]}
        />
        <h1>Favorites</h1>
        <div className={styles.favoriteListContainer}>
          <FavoriteCard
            showConfirmDialog={() => setShowDelete(true)}
            {...sampleFavorite1}
          />
          <FavoriteCard
            showConfirmDialog={() => setShowDelete(true)}
            {...sampleFavorite2}
          />
          <FavoriteCard
            showConfirmDialog={() => setShowDelete(true)}
            {...sampleFavorite3}
          />
          <FavoriteCard
            showConfirmDialog={() => setShowDelete(true)}
            {...sampleFavorite2}
          />
        </div>
      </AccountLayout>
      <Modal visible={showDelete} close={() => setShowDelete(false)}>
        <div className={styles.confirmDeleteContainer}>
          <h4>Remove from Favorites?</h4>
          <p>
            Are you sure you want to remove this from your favorites? You cannot
            undo this action once you press <strong>'Delete'</strong>
          </p>
          <div className={styles.actionContainer}>
            <Button onClick={() => setShowDelete(false)} level={'primary'}>
              Delete
            </Button>
            <Button onClick={() => setShowDelete(false)} level={'secondary'}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default FavoritesPage;
