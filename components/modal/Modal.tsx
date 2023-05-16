import React from 'react';
import Portal from './Portal';
import styles from './Modal.module.scss';

type Props = {
  title?: string;
  close: (e: any) => void;
  children: React.ReactNode;
};

const Modal: React.FC<Props> = (props) => {
  return (
    <Portal>
      <div className={styles.modal} onClick={props.close}>
        <div>
          <header>
            {props.title && <div>{props.title}</div>}
            <button type='button' onClick={props.close} />
          </header>
          <div>{props.children}</div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;
