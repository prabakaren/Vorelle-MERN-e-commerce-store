import { useState } from 'react';

const SHAPES = ['arch', 'round', 'pill', 'squircle'];

// Shows the product photo when an image URL exists. Otherwise (or if it fails to load)
// it draws a coloured tile with the product's initials, so the store never looks broken.
export default function ProductImage({ product, shape, className = '' }) {
  const [failed, setFailed] = useState(false);
  const pick = shape || SHAPES[(product.name?.length || 0) % SHAPES.length];
  const initials = (product.name || '?')
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0])
    .join('');

  return (
    <div
      className={`pimg pimg-${pick} ${className}`}
      style={{ '--tint': product.tint || '#4533ff' }}
    >
      {product.image && !failed ? (
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <span className="pimg-initials" aria-label={product.name} role="img">
          {initials}
        </span>
      )}
    </div>
  );
}
