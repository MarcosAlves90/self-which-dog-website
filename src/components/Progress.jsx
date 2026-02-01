import PropTypes from 'prop-types';

export default function Progress({ index, total }) {
  const pct = Math.round(((index - 1) / total) * 100);
  return (
    <div style={{display:'flex',alignItems:'center',gap:12,width:'100%'}}>
      <div className="c-progress" aria-hidden>
        <div className="c-progress__bar" style={{width: `${pct}%`}} />
      </div>
    </div>
  );
}

Progress.propTypes = {
  index: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
};
