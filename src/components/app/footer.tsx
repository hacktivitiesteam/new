import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-background mt-auto py-6">
      <div className="container mx-auto px-4 md:px-6 text-center text-sm text-muted-foreground">
        <p>Turism Helper</p>
        <p>by Hacktivities</p>
        <p>&copy; All Rights Reserved - {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
};

export default Footer;
