const React = require('react');

const { NotificationProvider } = require('./src/context/AddItemNotificationProvider');

exports.wrapRootElement = ({ element }) => (
  React.createElement(NotificationProvider, null, element)
);
