import React from "react"
import Portal from "./Portal"
import styles from "./Modal.module.scss"

type Props = {
  close: (e: any) => void;
  children: React.ReactNode;
};

const Modal: React.FC<Props> = props => {
  return (
    <Portal>
      <div className={styles.modal} onClick={props.close}>
        <div>
          <header>
            <button type="button" onClick={props.close} />
          </header>
          <div>
            {React.cloneElement(props.children as any, {
              close: props.close
            })}
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default Modal;