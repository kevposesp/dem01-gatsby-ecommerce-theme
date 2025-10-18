import React from 'react';
import * as styles from './viewed.module.css';

import AccountLayout from '../../components/AccountLayout';
import Breadcrumbs from '../../components/Breadcrumbs';
import Layout from '../../components/Layout/Layout';
import ProductCardGrid from '../../components/ProductCardGrid';

import { generateMockProductData } from '../../helpers/mock';

const RecentlyViewedPage = (props) => {
  const recentlyViewed = generateMockProductData(3, 'shirt');

  return (
    <Layout>
      <AccountLayout>
        <Breadcrumbs
          crumbs={[
            { link: '/', label: 'Home' },
            { link: '/account', label: 'Account' },
            { link: '/account/viewed', label: 'Recently Viewed' },
          ]}
        />
        <div className={styles.root}>
          <h1>Recently Viewed</h1>
          <div className={styles.gridContainer}>
            <ProductCardGrid
              spacing={true}
              height={480}
              columns={3}
              data={recentlyViewed}
            />
          </div>
        </div>
      </AccountLayout>
    </Layout>
  );
};

export default RecentlyViewedPage;
