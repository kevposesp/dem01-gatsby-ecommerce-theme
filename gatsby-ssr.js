const React = require('react');

const { NotificationProvider } = require('./src/context/AddItemNotificationProvider');
const { AuthProvider } = require('./src/context/AuthContext');

exports.wrapRootElement = ({ element }) => (
  React.createElement(AuthProvider, null,
    React.createElement(NotificationProvider, null, element)
  )
);
