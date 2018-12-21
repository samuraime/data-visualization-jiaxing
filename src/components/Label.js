import React from 'react';
import PropTypes from 'prop-types';
import s from './Label.module.scss';

export default function Label(props) {
  return (
    <div className={s.root} {...props}>{props.value}</div>
  );
}

Label.propTypes = {
  value: PropTypes.string,
};
