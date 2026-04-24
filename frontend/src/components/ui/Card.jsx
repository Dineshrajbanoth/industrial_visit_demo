import clsx from 'clsx';

function Card({ children, className = '' }) {
  return (
    <div className={clsx('glass rounded-xl2 border border-slate-200 p-5 shadow-soft', className)}>
      {children}
    </div>
  );
}

export default Card;
