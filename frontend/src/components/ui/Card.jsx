import React from 'react';

/**
 * Card Component
 * Reusable card container
 */
export const Card = ({
  children,
  className = '',
  variant = 'default',
  hover = false,
  ...props
}) => {
  const variants = {
    default: 'bg-surface border-2 border-border',
    glass: 'bg-surface/50 backdrop-blur-md border-2 border-border/50',
    gradient: 'bg-gradient-to-br from-surface to-background border-2 border-border',
  };

  const hoverEffect = hover
    ? 'hover:border-primary hover:shadow-lg hover:shadow-primary/20 transform hover:-translate-y-1'
    : '';

  return (
    <div
      className={`
        ${variants[variant]}
        rounded-2xl shadow-xl
        transition-all duration-300
        ${hoverEffect}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

/**
 * Card Header
 */
export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-b border-border ${className}`}>
      {children}
    </div>
  );
};

/**
 * Card Body
 */
export const CardBody = ({ children, className = '' }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};

/**
 * Card Footer
 */
export const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`p-6 border-t border-border ${className}`}>
      {children}
    </div>
  );
};

export default Card;
