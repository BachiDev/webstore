const Footer = () => {
  return (
    <footer className="bg-black text-white p-4 text-center mt-8">
      <div className="container mx-auto">
        <p>&copy; {new Date().getFullYear()} Fabian Bachmayer. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
