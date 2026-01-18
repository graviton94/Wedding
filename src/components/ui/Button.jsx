import { motion } from 'framer-motion';

const Button = ({
  children,
  onClick,
  variant = 'primary',
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-theme-primary text-white hover:bg-theme-secondary active:bg-theme-primary-active',
    secondary: 'bg-white text-theme-primary border-2 border-theme-primary hover:bg-theme-primary hover:text-white',
    outline: 'bg-transparent border-2 border-theme-primary text-theme-primary hover:bg-theme-primary hover:text-white',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`py-3 px-6 rounded-lg font-semibold transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
