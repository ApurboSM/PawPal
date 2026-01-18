import React from 'react';
import { Route, Switch } from 'wouter';
import { AuthProvider } from './src/hooks/use-auth';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { ProfilePage } from './components/profile/ProfilePage';
import { Navbar } from './src/components/layout/navbar';

export function App() {
  return (
    <AuthProvider>
      <Navbar />
      <Switch>
        <Route path="/login" component={LoginForm} />
        <Route path="/register" component={RegisterForm} />
        <Route path="/profile" component={ProfilePage} />
        {/* Add other routes here */}
      </Switch>
    </AuthProvider>
  );
} 