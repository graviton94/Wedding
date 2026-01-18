import { motion } from 'framer-motion';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '',
  ...props 
}) => {
  const variants = {
    primary: 'bg-[#D4AF37] text-white hover:bg-[#C19B2F]',
    secondary: 'bg-white text-[#D4AF37] border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-white',
    outline: 'bg-transparent border-2 border-[#333333] text-[#333333] hover:bg-[#333333] hover:text-white',
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
